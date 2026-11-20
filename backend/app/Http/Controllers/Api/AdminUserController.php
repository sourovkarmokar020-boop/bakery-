<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    private array $panelRoles = ['admin', 'super_admin'];
    private array $assignableRoles = ['user', 'admin', 'super_admin'];

    public function store(Request $request): JsonResponse
    {
        $this->ensurePanelAdmin($request);

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['nullable', Rule::in($this->assignableRoles)],
        ]);

        $role = $data['role'] ?? 'admin';
        // শুধু সুপার এডমিনই নতুন সুপার এডমিন বানাতে পারবে
        $this->ensureCanAssignRole($request, $role);

        $user = DB::transaction(function () use ($data, $role) {
            $user = User::create([
                'name' => $data['name'] ?: $data['email'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
            ]);

            $this->syncProfileAndCustomer($user);
            $this->replaceRole((string) $user->id, $role);

            return $user;
        });

        return response()->json(['data' => $this->userPayload($user)], 201);
    }

    public function updateRole(Request $request, string $user): JsonResponse
    {
        $this->ensurePanelAdmin($request);

        $data = $request->validate([
            'role' => ['required', Rule::in($this->assignableRoles)],
        ]);

        $target = User::findOrFail($user);
        if ((string) $request->user()->id === (string) $target->id && $data['role'] === 'user') {
            return response()->json(['message' => 'নিজের এডমিন অ্যাক্সেস সরানো যাবে না।'], 422);
        }

        // সুপার এডমিন role দেওয়া, বা কোনো সুপার এডমিনের role বদলানো — শুধু সুপার এডমিনই পারবে
        $this->ensureCanAssignRole($request, $data['role']);
        if ($this->userHasRole((string) $target->id, 'super_admin') && ! $this->isSuperAdmin($request)) {
            return response()->json(['message' => 'শুধু সুপার এডমিনই একজন সুপার এডমিনের রোল বদলাতে পারবেন।'], 403);
        }

        DB::transaction(fn () => $this->replaceRole((string) $target->id, $data['role']));

        return response()->json(['data' => $this->userPayload($target->fresh())]);
    }

    private function ensurePanelAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless(
            $user && DB::table('user_roles')
                ->where('user_id', (string) $user->id)
                ->whereIn('role', $this->panelRoles)
                ->exists(),
            403
        );
    }

    private function isSuperAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user && $this->userHasRole((string) $user->id, 'super_admin');
    }

    private function userHasRole(string $userId, string $role): bool
    {
        return DB::table('user_roles')->where('user_id', $userId)->where('role', $role)->exists();
    }

    /** সুপার এডমিন role অ্যাসাইন করতে চাইলে অনুরোধকারীকেও সুপার এডমিন হতে হবে */
    private function ensureCanAssignRole(Request $request, string $role): void
    {
        if ($role === 'super_admin' && ! $this->isSuperAdmin($request)) {
            abort(403, 'শুধু সুপার এডমিনই নতুন সুপার এডমিন তৈরি করতে পারবেন।');
        }
    }

    private function replaceRole(string $userId, string $role): void
    {
        DB::table('user_roles')->where('user_id', $userId)->delete();
        DB::table('user_roles')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'role' => $role,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function syncProfileAndCustomer(User $user): void
    {
        $now = now();
        $profile = [
            'full_name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'address' => $user->address,
            'updated_at' => $now,
        ];

        if (DB::table('profiles')->where('user_id', (string) $user->id)->exists()) {
            DB::table('profiles')->where('user_id', (string) $user->id)->update($profile);
        } else {
            DB::table('profiles')->insert($profile + [
                'id' => (string) Str::uuid(),
                'user_id' => (string) $user->id,
                'created_at' => $now,
            ]);
        }

        if (!$user->phone) {
            return;
        }

        $customer = [
            'name' => $user->name,
            'email' => $user->email,
            'address' => $user->address,
            'user_id' => (string) $user->id,
            'updated_at' => $now,
        ];

        if (DB::table('customers')->where('phone', $user->phone)->exists()) {
            DB::table('customers')->where('phone', $user->phone)->update($customer);
        } else {
            DB::table('customers')->insert($customer + [
                'id' => (string) Str::uuid(),
                'phone' => $user->phone,
                'total_orders' => 0,
                'total_spent' => 0,
                'created_at' => $now,
            ]);
        }
    }

    private function userPayload(User $user): array
    {
        $roles = DB::table('user_roles')
            ->where('user_id', (string) $user->id)
            ->pluck('role')
            ->all();

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'roles' => $roles,
        ];
    }
}
