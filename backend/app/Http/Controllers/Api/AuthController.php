<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:6'],
            'full_name' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $data['full_name'] ?? $data['email'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
        ]);

        $this->createUserRecords($user);

        return response()->json($this->sessionPayload($user), 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        return response()->json($this->sessionPayload($user));
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        // রোলটাও একসাথে পাঠাই — না হলে ফ্রন্টএন্ডকে user_roles এর জন্য আলাদা রিকোয়েস্ট করতে হয়
        $role = $user
            ? DB::table('user_roles')
                ->where('user_id', $user->id)
                ->whereIn('role', ['admin', 'super_admin'])
                ->value('role')
            : null;

        return response()->json(['user' => $user, 'role' => $role]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }

    private function sessionPayload(User $user): array
    {
        $token = $user->createToken('react-spa')->plainTextToken;

        $role = DB::table('user_roles')
            ->where('user_id', $user->id)
            ->whereIn('role', ['admin', 'super_admin'])
            ->value('role');

        return [
            'session' => [
                'access_token' => $token,
                'user' => $user,
                'role' => $role,
            ],
            'user' => $user,
            'role' => $role,
        ];
    }

    private function createUserRecords(User $user): void
    {
        // updateOrInsert() এর ভ্যালুতে 'id' রাখা যাবে না — সারি আগে থেকে থাকলে
        // সেটি UPDATE হয়ে যায়, অর্থাৎ প্রাইমারি কী বদলে যায়। কাস্টমারের ক্ষেত্রে
        // এর মানে হতো: গেস্ট অবস্থায় জমানো সব কয়েন (coin_balances/coin_transactions
        // পুরনো customer_id ধরে আছে) রেজিস্টার করার সাথে সাথেই হারিয়ে যেত।
        $profile = DB::table('profiles')->where('user_id', (string) $user->id)->first();
        $profileData = [
            'full_name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'updated_at' => now(),
        ];

        if ($profile) {
            DB::table('profiles')->where('id', $profile->id)->update($profileData);
        } else {
            DB::table('profiles')->insert($profileData + [
                'id' => (string) Str::uuid(),
                'user_id' => (string) $user->id,
                'created_at' => now(),
            ]);
        }

        if ($user->phone) {
            $customer = DB::table('customers')->where('phone', $user->phone)->first();
            $customerData = [
                'name' => $user->name,
                'email' => $user->email,
                'user_id' => (string) $user->id,
                'updated_at' => now(),
            ];

            if ($customer) {
                // আগের সারিটাই রাখা হয় — তাই গেস্ট অবস্থার কয়েন, অর্ডার ইতিহাস
                // সবকিছু নতুন অ্যাকাউন্টের সাথে যুক্ত থাকে
                DB::table('customers')->where('id', $customer->id)->update($customerData);
            } else {
                DB::table('customers')->insert($customerData + [
                    'id' => (string) Str::uuid(),
                    'phone' => $user->phone,
                    'total_orders' => 0,
                    'total_spent' => 0,
                    'created_at' => now(),
                ]);
            }
        }

        DB::table('user_roles')->updateOrInsert(
            ['user_id' => (string) $user->id, 'role' => 'user'],
            ['id' => (string) Str::uuid(), 'updated_at' => now(), 'created_at' => now()]
        );
    }
}
