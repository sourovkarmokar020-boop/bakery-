<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CoinService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * কয়েন সিস্টেমের API।
 *
 * ইচ্ছাকৃতভাবে এটি QueryController-এর জেনেরিক টেবিল CRUD-এর বাইরে রাখা হয়েছে।
 * ওই এন্ডপয়েন্টে কোনো auth নেই — coin_balances সেখানে খুলে দিলে যে কেউ
 * নিজের ব্যালেন্স যা খুশি সেট করতে পারত।
 */
class CoinController extends Controller
{
    public function __construct(private CoinService $coins)
    {
    }

    /* ---------------------------------------------------------------- public */

    /** স্টোরফ্রন্টের জন্য — কোনো গোপন তথ্য নেই */
    public function publicSettings(): JsonResponse
    {
        $s = $this->coins->settings();

        return response()->json(['data' => [
            'is_enabled' => (bool) $s->is_enabled,
            'allow_checkout_redeem' => (bool) $s->allow_checkout_redeem,
            'allow_product_redeem' => (bool) $s->allow_product_redeem,
            'earn_coins_per_100' => (int) $s->earn_coins_per_100,
            'redeem_coins_per_taka' => (int) $s->redeem_coins_per_taka,
            'min_order_to_earn' => (float) $s->min_order_to_earn,
            'max_coins_per_order' => $s->max_coins_per_order !== null ? (int) $s->max_coins_per_order : null,
            'min_balance_to_redeem' => (int) $s->min_balance_to_redeem,
            'max_redeem_percent' => (int) $s->max_redeem_percent,
            'expiry_months' => $s->expiry_months !== null ? (int) $s->expiry_months : null,
            'tiers' => $this->coins->tiers(),
        ]]);
    }

    /* ---------------------------------------------------------------- customer */

    public function me(Request $request): JsonResponse
    {
        $customerId = $this->currentCustomerId($request);
        if (! $customerId) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $this->coins->balance($customerId)]);
    }

    public function myTransactions(Request $request): JsonResponse
    {
        $customerId = $this->currentCustomerId($request);
        if (! $customerId) {
            return response()->json(['data' => []]);
        }

        $rows = DB::table('coin_transactions')
            ->where('customer_id', $customerId)
            ->whereIn('status', ['pending', 'available', 'consumed', 'expired', 'reversed'])
            ->orderByDesc('created_at')
            ->limit((int) $request->input('limit', 50))
            ->get(['id', 'type', 'amount', 'balance_after', 'status', 'order_id', 'note', 'expires_at', 'available_at', 'created_at']);

        $orderNumbers = DB::table('orders')
            ->whereIn('id', $rows->pluck('order_id')->filter()->unique()->all())
            ->pluck('order_number', 'id');

        return response()->json(['data' => $rows->map(fn ($r) => (array) $r + [
            'order_number' => $r->order_id ? ($orderNumbers[$r->order_id] ?? null) : null,
        ])->all()]);
    }

    /** চেকআউটে কয়েন খরচ — ছাড়ের অঙ্ক সার্ভারেই হিসাব হয় */
    public function apply(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'string'],
            'coins' => ['required', 'integer', 'min:1'],
        ]);

        $customerId = $this->currentCustomerId($request);
        if (! $customerId) {
            return response()->json(['message' => 'কয়েন ব্যবহার করতে লগইন করুন।'], 401);
        }

        $order = DB::table('orders')->where('id', $data['order_id'])->first();
        if (! $order) {
            return response()->json(['message' => 'অর্ডার খুঁজে পাওয়া যায়নি।'], 404);
        }

        // অর্ডারটি সত্যিই এই কাস্টমারের কিনা — নাহলে অন্যের অর্ডারে
        // নিজের কয়েন বসিয়ে দেওয়া যেত (এবং উল্টোটাও)
        $orderCustomerId = $this->coins->resolveCustomerId($order->user_id ?? null, $order->customer_phone ?? null);
        if ($orderCustomerId !== $customerId) {
            return response()->json(['message' => 'এই অর্ডারে কয়েন ব্যবহার করা যাবে না।'], 403);
        }

        // শুধু সদ্য তৈরি অর্ডারে — পুরনো অর্ডারে ফিরে গিয়ে ছাড় বসানো যাবে না
        if (now()->diffInMinutes($order->created_at) > 30) {
            return response()->json(['message' => 'এই অর্ডারের সময় শেষ হয়ে গেছে।'], 422);
        }

        try {
            $result = $this->coins->redeemForOrder($customerId, $data['order_id'], (int) $data['coins']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $result]);
    }

    /** কার্টে দেখানোর জন্য: কত কয়েন খরচ করা যাবে, কত ছাড় হবে */
    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $customerId = $this->currentCustomerId($request);
        $balance = $customerId ? $this->coins->balance($customerId) : null;
        $available = (int) ($balance['available'] ?? 0);

        $maxCoins = $this->coins->maxRedeemableFor((float) $data['subtotal'], $available);

        return response()->json(['data' => [
            'available' => $available,
            'max_coins' => $maxCoins,
            'max_discount' => $this->coins->coinsToTaka($maxCoins),
            'min_balance_to_redeem' => (int) $this->coins->settings()->min_balance_to_redeem,
            'will_earn' => $this->coins->previewEarn((float) $data['subtotal'], $customerId),
        ]]);
    }

    /* ---------------------------------------------------------------- ফ্রি প্রোডাক্ট */

    /** চেকআউটে দেখানোর তালিকা — গেস্টও দেখতে পায় (কিনতে হলে লগইন লাগবে) */
    public function rewards(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->coins->rewardCatalog($this->currentCustomerId($request))]);
    }

    public function redeemProduct(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'string'],
            'catalog_id' => ['required', 'string'],
        ]);

        $customerId = $this->currentCustomerId($request);
        if (! $customerId) {
            return response()->json(['message' => 'ফ্রি প্রোডাক্ট নিতে লগইন করুন।'], 401);
        }

        $order = DB::table('orders')->where('id', $data['order_id'])->first();
        if (! $order) {
            return response()->json(['message' => 'অর্ডার খুঁজে পাওয়া যায়নি।'], 404);
        }

        $orderCustomerId = $this->coins->resolveCustomerId($order->user_id ?? null, $order->customer_phone ?? null);
        if ($orderCustomerId !== $customerId) {
            return response()->json(['message' => 'এই অর্ডারে ফ্রি প্রোডাক্ট নেওয়া যাবে না।'], 403);
        }

        if (now()->diffInMinutes($order->created_at) > 30) {
            return response()->json(['message' => 'এই অর্ডারের সময় শেষ হয়ে গেছে।'], 422);
        }

        try {
            $result = $this->coins->redeemRewardProduct($customerId, $data['order_id'], $data['catalog_id']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $result]);
    }

    public function adminRewards(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $rows = DB::table('coin_reward_catalog as c')
            ->leftJoin('products as p', 'p.id', '=', 'c.product_id')
            ->orderBy('c.sort_order')
            ->get([
                'c.*', 'p.name', 'p.name_bn', 'p.image_url',
                'p.base_price', 'p.sale_price', 'p.stock_quantity',
            ]);

        return response()->json(['data' => $rows->map(fn ($r) => (array) $r)->all()]);
    }

    public function saveReward(Request $request, ?string $id = null): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'product_id' => ['required', 'string', 'exists:products,id'],
            'coin_cost' => ['required', 'integer', 'min:1'],
            'stock_limit' => ['nullable', 'integer', 'min:0'],
            'max_per_customer' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $data['sort_order'] ??= 0;
        $data['updated_at'] = now();

        if ($id) {
            DB::table('coin_reward_catalog')->where('id', $id)->update($data);
        } else {
            // একই প্রোডাক্ট দুবার ক্যাটালগে থাকলে স্টকের হিসাব দুই জায়গায় ভাগ হয়ে যেত
            if (DB::table('coin_reward_catalog')->where('product_id', $data['product_id'])->exists()) {
                return response()->json(['message' => 'এই প্রোডাক্টটি ইতিমধ্যে রিওয়ার্ড তালিকায় আছে।'], 422);
            }

            $id = (string) Str::uuid();
            DB::table('coin_reward_catalog')->insert($data + [
                'id' => $id,
                'redeemed_count' => 0,
                'created_at' => now(),
            ]);
        }

        return response()->json(['data' => (array) DB::table('coin_reward_catalog')->where('id', $id)->first()]);
    }

    public function deleteReward(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request);

        DB::table('coin_reward_catalog')->where('id', $id)->delete();

        return response()->json(['data' => null]);
    }

    /* ---------------------------------------------------------------- admin */

    public function adminSettings(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(['data' => (array) $this->coins->settings()]);
    }

    public function saveSettings(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'is_enabled' => ['required', 'boolean'],
            'allow_checkout_redeem' => ['required', 'boolean'],
            'allow_product_redeem' => ['required', 'boolean'],
            'earn_coins_per_100' => ['required', 'integer', 'min:0', 'max:100000'],
            'redeem_coins_per_taka' => ['required', 'integer', 'min:1', 'max:100000'],
            'min_order_to_earn' => ['required', 'numeric', 'min:0'],
            'max_coins_per_order' => ['nullable', 'integer', 'min:1'],
            'min_balance_to_redeem' => ['required', 'integer', 'min:0'],
            'max_redeem_percent' => ['required', 'integer', 'min:1', 'max:100'],
            'expiry_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'cooling_days' => ['required', 'integer', 'min:0', 'max:365'],
            'earn_on_discounted' => ['required', 'boolean'],
        ]);

        $existing = DB::table('coin_settings')->first();
        $data['updated_at'] = now();

        if ($existing) {
            DB::table('coin_settings')->where('id', $existing->id)->update($data);
        } else {
            DB::table('coin_settings')->insert($data + [
                'id' => (string) Str::uuid(),
                'created_at' => now(),
            ]);
        }

        $this->coins->forgetSettings();

        return response()->json(['data' => (array) $this->coins->settings()]);
    }

    public function stats(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $totals = DB::table('coin_balances')->selectRaw(
            'COALESCE(SUM(available),0) AS available,
             COALESCE(SUM(pending),0) AS pending,
             COALESCE(SUM(lifetime_earned),0) AS lifetime_earned,
             COALESCE(SUM(lifetime_redeemed),0) AS lifetime_redeemed,
             COALESCE(SUM(lifetime_expired),0) AS lifetime_expired,
             COUNT(*) AS holders'
        )->first();

        $activeHolders = DB::table('coin_balances')->where('available', '>', 0)->count();

        $redeemed30 = (int) abs((int) DB::table('coin_transactions')
            ->where('type', 'redeem')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount'));

        $earned30 = (int) DB::table('coin_transactions')
            ->where('type', 'earn')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount');

        $available = (int) $totals->available;

        return response()->json(['data' => [
            'available' => $available,
            'pending' => (int) $totals->pending,
            'lifetime_earned' => (int) $totals->lifetime_earned,
            'lifetime_redeemed' => (int) $totals->lifetime_redeemed,
            'lifetime_expired' => (int) $totals->lifetime_expired,
            'holders' => (int) $totals->holders,
            'active_holders' => $activeHolders,
            'earned_30d' => $earned30,
            'redeemed_30d' => $redeemed30,
            // যত কয়েন এখনো খরচ হয়নি × রিডিম রেট = যত টাকার দায় বাকি আছে
            'liability_taka' => $this->coins->coinsToTaka($available),
            'effective_rate_percent' => $this->coins->effectiveRatePercent(),
        ]]);
    }

    public function customers(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $search = trim((string) $request->input('search', ''));

        $query = DB::table('coin_balances')
            ->join('customers', 'customers.id', '=', 'coin_balances.customer_id')
            ->select([
                'coin_balances.customer_id',
                'customers.name',
                'customers.phone',
                'coin_balances.available',
                'coin_balances.pending',
                'coin_balances.lifetime_earned',
                'coin_balances.lifetime_redeemed',
            ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('customers.name', 'like', "%{$search}%")
                    ->orWhere('customers.phone', 'like', "%{$search}%");
            });
        }

        $rows = $query->orderByDesc('coin_balances.available')
            ->limit((int) $request->input('limit', 50))
            ->get();

        return response()->json(['data' => $rows->map(function ($r) {
            $row = (array) $r;
            $row['taka_value'] = $this->coins->coinsToTaka((int) $r->available);
            $row['tier'] = $this->coins->tierFor((int) $r->lifetime_earned);

            return $row;
        })->all()]);
    }

    public function customerTransactions(Request $request, string $customerId): JsonResponse
    {
        $this->ensureAdmin($request);

        $rows = DB::table('coin_transactions')
            ->where('customer_id', $customerId)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json(['data' => $rows->map(fn ($r) => (array) $r)->all()]);
    }

    public function adjust(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'customer_id' => ['required', 'string'],
            'amount' => ['required', 'integer'],
            'note' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        try {
            $this->coins->adjust(
                $data['customer_id'],
                (int) $data['amount'],
                $data['note'],
                (string) $request->user()->id,
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $this->coins->balance($data['customer_id'])]);
    }

    /* ---------------------------------------------------------------- tiers */

    public function tiers(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $rows = DB::table('coin_tiers')->orderBy('min_lifetime_coins')->get();

        return response()->json(['data' => $rows->map(fn ($r) => (array) $r)->all()]);
    }

    public function saveTier(Request $request, ?string $id = null): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'name_bn' => ['nullable', 'string', 'max:100'],
            'min_lifetime_coins' => ['required', 'integer', 'min:0'],
            'multiplier' => ['required', 'numeric', 'min:1', 'max:10'],
            'color' => ['nullable', 'string', 'max:20'],
            'benefits' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $data['updated_at'] = now();

        if ($id) {
            DB::table('coin_tiers')->where('id', $id)->update($data);
        } else {
            $id = (string) Str::uuid();
            DB::table('coin_tiers')->insert($data + ['id' => $id, 'created_at' => now()]);
        }

        return response()->json(['data' => (array) DB::table('coin_tiers')->where('id', $id)->first()]);
    }

    public function deleteTier(Request $request, string $id): JsonResponse
    {
        $this->ensureAdmin($request);

        DB::table('coin_tiers')->where('id', $id)->delete();

        return response()->json(['data' => null]);
    }

    /* ---------------------------------------------------------------- helpers */

    private function currentCustomerId(Request $request): ?string
    {
        // quote রুটটি পাবলিক, তাই সেখানে $request->user() ফাঁকা থাকে — টোকেন
        // থাকলে sanctum গার্ড দিয়ে ইউজার বের করা হয়, না থাকলে null (গেস্ট)।
        $user = $request->user() ?? $request->user('sanctum');
        if (! $user) {
            return null;
        }

        return $this->coins->resolveCustomerId((string) $user->id, $user->phone ?? null);
    }

    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();

        abort_unless(
            $user && DB::table('user_roles')
                ->where('user_id', (string) $user->id)
                ->whereIn('role', ['admin', 'super_admin'])
                ->exists(),
            403
        );
    }
}
