<?php

namespace App\Services;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * কয়েন সিস্টেমের একমাত্র লেখার পথ।
 *
 * অ্যাপের আর কোথাও যেন coin_balances সরাসরি UPDATE না করে — প্রতিটি পরিবর্তন
 * এখানকার post() দিয়ে যায়, যা একই ট্রানজেকশনে লেজার সারি লেখে ও ব্যালেন্স
 * আপডেট করে, সবটাই SELECT ... FOR UPDATE লকের ভেতরে।
 */
class CoinService
{
    private ?object $settings = null;

    /* ---------------------------------------------------------------- settings */

    public function settings(): object
    {
        if ($this->settings === null) {
            $this->settings = DB::table('coin_settings')->first() ?: (object) [
                'is_enabled' => false,
                'allow_checkout_redeem' => false,
                'allow_product_redeem' => false,
                'earn_coins_per_100' => 100,
                'redeem_coins_per_taka' => 100,
                'min_order_to_earn' => 0,
                'max_coins_per_order' => null,
                'min_balance_to_redeem' => 0,
                'max_redeem_percent' => 100,
                'expiry_months' => null,
                'cooling_days' => 0,
                'earn_on_discounted' => true,
            ];
        }

        return $this->settings;
    }

    public function forgetSettings(): void
    {
        $this->settings = null;
    }

    public function isEnabled(): bool
    {
        return (bool) $this->settings()->is_enabled;
    }

    /** ১ টাকা খরচে কত টাকা ফেরত — এই একটি সংখ্যাই আসল রিওয়ার্ড রেট */
    public function effectiveRatePercent(): float
    {
        $s = $this->settings();
        $per100 = (int) $s->earn_coins_per_100;
        $perTaka = (int) $s->redeem_coins_per_taka;

        if ($per100 <= 0 || $perTaka <= 0) {
            return 0.0;
        }

        return round(($per100 / $perTaka), 4);
    }

    /* ---------------------------------------------------------------- identity */

    public function resolveCustomerId(?string $userId, ?string $phone): ?string
    {
        if ($phone) {
            $id = DB::table('customers')->where('phone', $phone)->value('id');
            if ($id) {
                return (string) $id;
            }
        }

        if ($userId) {
            $id = DB::table('customers')->where('user_id', $userId)->value('id');
            if ($id) {
                return (string) $id;
            }

            $userPhone = DB::table('users')->where('id', $userId)->value('phone');
            if ($userPhone) {
                $id = DB::table('customers')->where('phone', $userPhone)->value('id');
                if ($id) {
                    return (string) $id;
                }
            }
        }

        return null;
    }

    /* ---------------------------------------------------------------- balance */

    public function balance(string $customerId): array
    {
        $row = DB::table('coin_balances')->where('customer_id', $customerId)->first();

        $balance = [
            'available' => (int) ($row->available ?? 0),
            'pending' => (int) ($row->pending ?? 0),
            'lifetime_earned' => (int) ($row->lifetime_earned ?? 0),
            'lifetime_redeemed' => (int) ($row->lifetime_redeemed ?? 0),
            'lifetime_expired' => (int) ($row->lifetime_expired ?? 0),
        ];

        $balance['taka_value'] = $this->coinsToTaka($balance['available']);
        $balance['tier'] = $this->tierFor($balance['lifetime_earned']);
        $balance['next_tier'] = $this->nextTierFor($balance['lifetime_earned']);

        return $balance;
    }

    public function tiers(): array
    {
        return DB::table('coin_tiers')->where('is_active', true)->orderBy('min_lifetime_coins')->get()
            ->map(fn ($t) => (array) $t)->all();
    }

    public function tierFor(int $lifetimeEarned): ?array
    {
        $tier = DB::table('coin_tiers')
            ->where('is_active', true)
            ->where('min_lifetime_coins', '<=', $lifetimeEarned)
            ->orderByDesc('min_lifetime_coins')
            ->first();

        return $tier ? (array) $tier : null;
    }

    private function nextTierFor(int $lifetimeEarned): ?array
    {
        $tier = DB::table('coin_tiers')
            ->where('is_active', true)
            ->where('min_lifetime_coins', '>', $lifetimeEarned)
            ->orderBy('min_lifetime_coins')
            ->first();

        return $tier ? (array) $tier : null;
    }

    private function multiplierFor(string $customerId): float
    {
        $lifetime = (int) DB::table('coin_balances')->where('customer_id', $customerId)->value('lifetime_earned');
        $tier = $this->tierFor($lifetime);

        return (float) ($tier['multiplier'] ?? 1.0);
    }

    /* ---------------------------------------------------------------- maths */

    public function coinsToTaka(int $coins): float
    {
        $perTaka = (int) $this->settings()->redeem_coins_per_taka;
        if ($perTaka <= 0) {
            return 0.0;
        }

        // নিচের দিকে ২ দশমিক — কাস্টমারকে যা দেখানো হয় তার বেশি কখনো দেওয়া হয় না
        return floor(($coins / $perTaka) * 100) / 100;
    }

    public function takaToCoins(float $taka): int
    {
        return (int) ceil($taka * (int) $this->settings()->redeem_coins_per_taka);
    }

    /** ডেলিভারি চার্জ বাদে, সব ডিসকাউন্টের পরের পণ্যমূল্য */
    public function earnBase(object $order): float
    {
        $base = (float) $order->subtotal
            - (float) ($order->discount ?? 0)
            - (float) ($order->coin_discount ?? 0);

        return max(0, round($base, 2));
    }

    public function previewEarn(float $base, ?string $customerId = null): int
    {
        $s = $this->settings();

        if (! $this->isEnabled() || $base < (float) $s->min_order_to_earn) {
            return 0;
        }

        $multiplier = $customerId ? $this->multiplierFor($customerId) : 1.0;
        $coins = (int) floor($base / 100 * (int) $s->earn_coins_per_100 * $multiplier);

        if ($s->max_coins_per_order !== null) {
            $coins = min($coins, (int) $s->max_coins_per_order);
        }

        return max(0, $coins);
    }

    /** এই অর্ডারে সর্বোচ্চ কত কয়েন খরচ করা যাবে */
    public function maxRedeemableFor(float $subtotal, int $availableBalance): int
    {
        $s = $this->settings();

        if (! $this->isEnabled() || ! $s->allow_checkout_redeem) {
            return 0;
        }

        $capTaka = $subtotal * ((int) $s->max_redeem_percent) / 100;
        $capCoins = (int) floor($capTaka * (int) $s->redeem_coins_per_taka);

        return max(0, min($availableBalance, $capCoins));
    }

    /* ---------------------------------------------------------------- earning */

    public function earnForOrder(string $orderId): ?array
    {
        if (! $this->isEnabled()) {
            return null;
        }

        $order = DB::table('orders')->where('id', $orderId)->first();
        if (! $order) {
            return null;
        }

        $customerId = $this->resolveCustomerId($order->user_id ?? null, $order->customer_phone ?? null);
        if (! $customerId) {
            return null;
        }

        $s = $this->settings();
        $base = $this->earnBase($order);

        if (! $s->earn_on_discounted && ((float) ($order->discount ?? 0) > 0 || (float) ($order->coin_discount ?? 0) > 0)) {
            return null;
        }

        $coins = $this->previewEarn($base, $customerId);
        if ($coins <= 0) {
            return null;
        }

        $coolingDays = (int) $s->cooling_days;
        $pending = $coolingDays > 0;

        $row = $this->post($customerId, [
            'type' => 'earn',
            'amount' => $coins,
            'status' => $pending ? 'pending' : 'available',
            'source_type' => 'order',
            'source_id' => $orderId,
            'order_id' => $orderId,
            'available_at' => now()->addDays($coolingDays),
            'expires_at' => $s->expiry_months ? now()->addDays($coolingDays)->addMonths((int) $s->expiry_months) : null,
            'earn_rate_used' => (int) $s->earn_coins_per_100,
            'redeem_rate_used' => (int) $s->redeem_coins_per_taka,
            'multiplier_applied' => $this->multiplierFor($customerId),
            'idempotency_key' => "earn:order:{$orderId}",
            'note' => 'অর্ডার থেকে কয়েন',
        ], $pending
            ? ['pending' => $coins]
            : ['available' => $coins, 'lifetime_earned' => $coins]);

        if ($row) {
            DB::table('orders')->where('id', $orderId)->update(['coins_earned' => $coins]);
        }

        return $row;
    }

    /* ---------------------------------------------------------------- reversal */

    /** বাতিল/রিফান্ড: অর্জিত কয়েন ফেরত নেওয়া হয়, খরচ করা কয়েন ফিরিয়ে দেওয়া হয় */
    public function reverseForOrder(string $orderId, string $reason = 'অর্ডার বাতিল'): void
    {
        $order = DB::table('orders')->where('id', $orderId)->first();
        if (! $order) {
            return;
        }

        $customerId = $this->resolveCustomerId($order->user_id ?? null, $order->customer_phone ?? null);
        if (! $customerId) {
            return;
        }

        // ১) অর্জিত কয়েন ফেরত নেওয়া
        $earned = DB::table('coin_transactions')
            ->where('order_id', $orderId)
            ->where('type', 'earn')
            ->whereIn('status', ['pending', 'available'])
            ->get();

        foreach ($earned as $tx) {
            // পুরো অঙ্কই ফেরত নেওয়া হয় — খরচ হয়ে যাওয়া অংশও।
            // শুধু অবশিষ্ট অংশ ফেরত নিলে "অর্ডার করে কয়েন নাও, অর্ধেক খরচ করো,
            // তারপর অর্ডার বাতিল করো" — এভাবে বাকিটা রেখে দেওয়া যেত।
            // ফলে ব্যালেন্স নেগেটিভ হতে পারে; সেটাই সঠিক আচরণ, পরের অর্জনে নিজেই ঠিক হয়ে যায়।
            $amount = (int) $tx->amount;
            if ($amount <= 0) {
                continue;
            }

            $wasPending = $tx->status === 'pending';

            $posted = $this->post($customerId, [
                'type' => 'reverse',
                'amount' => -$amount,
                'status' => 'available',
                'source_type' => 'order',
                'source_id' => $orderId,
                'order_id' => $orderId,
                'reverses_id' => $tx->id,
                'idempotency_key' => "reverse:earn:{$tx->id}",
                'note' => $reason,
            ], $wasPending
                ? ['pending' => -$amount]
                : ['available' => -$amount, 'lifetime_earned' => -$amount]);

            if ($posted) {
                DB::table('coin_transactions')->where('id', $tx->id)->update([
                    'status' => 'reversed',
                    'consumed' => (int) $tx->amount,
                    'updated_at' => now(),
                ]);
            }
        }

        // ২) খরচ করা কয়েন ফিরিয়ে দেওয়া — মেয়াদ আগেরটাই থাকে, নাহলে
        //    বারবার অর্ডার বাতিল করে মেয়াদ বাড়ানো যেত।
        $redeemed = DB::table('coin_transactions')
            ->where('order_id', $orderId)
            ->where('type', 'redeem')
            ->where('status', '!=', 'reversed')
            ->get();

        // ফ্রি প্রোডাক্টের স্টক আগে ফেরত দেওয়া হয় — ব্যালেন্স লক নেওয়ার আগেই,
        // যাতে লকের ক্রম সবসময় ক্যাটালগ → ব্যালেন্স থাকে (ডেডলক এড়াতে)
        foreach ($redeemed->where('source_type', 'reward_product') as $tx) {
            if ($tx->source_id) {
                DB::table('coin_reward_catalog')
                    ->where('id', $tx->source_id)
                    ->where('redeemed_count', '>', 0)
                    ->decrement('redeemed_count');
            }
        }

        foreach ($redeemed as $tx) {
            $amount = abs((int) $tx->amount);
            if ($amount <= 0) {
                continue;
            }

            $posted = $this->post($customerId, [
                'type' => 'refund_return',
                'amount' => $amount,
                'status' => 'available',
                'source_type' => 'order',
                'source_id' => $orderId,
                'order_id' => $orderId,
                'reverses_id' => $tx->id,
                'expires_at' => $tx->expires_at,
                'idempotency_key' => "return:redeem:{$tx->id}",
                'note' => $reason.' — কয়েন ফেরত',
            ], ['available' => $amount, 'lifetime_redeemed' => -$amount]);

            if ($posted) {
                DB::table('coin_transactions')->where('id', $tx->id)->update([
                    'status' => 'reversed',
                    'updated_at' => now(),
                ]);
            }
        }

        DB::table('orders')->where('id', $orderId)->update(['coins_earned' => 0, 'reward_coins' => 0]);
    }

    /* ---------------------------------------------------------------- redeem */

    /**
     * চেকআউটে কয়েন খরচ। ডিসকাউন্টের অঙ্ক সবসময় সার্ভারে ডাটাবেসের subtotal
     * থেকে হিসাব হয় — ক্লায়েন্টের পাঠানো টাকার অঙ্ক কখনো বিশ্বাস করা হয় না।
     *
     * @throws \RuntimeException বৈধতা ব্যর্থ হলে
     */
    public function redeemForOrder(string $customerId, string $orderId, int $coins): array
    {
        $s = $this->settings();

        if (! $this->isEnabled() || ! $s->allow_checkout_redeem) {
            throw new \RuntimeException('কয়েন ব্যবহার এখন বন্ধ আছে।');
        }

        if ($coins <= 0) {
            throw new \RuntimeException('কয়েনের পরিমাণ সঠিক নয়।');
        }

        $order = DB::table('orders')->where('id', $orderId)->first();
        if (! $order) {
            throw new \RuntimeException('অর্ডার খুঁজে পাওয়া যায়নি।');
        }

        if ((int) $order->coins_redeemed > 0) {
            throw new \RuntimeException('এই অর্ডারে ইতিমধ্যে কয়েন ব্যবহার করা হয়েছে।');
        }

        $balance = (int) DB::table('coin_balances')->where('customer_id', $customerId)->value('available');

        if ($balance < (int) $s->min_balance_to_redeem || $coins < (int) $s->min_balance_to_redeem) {
            throw new \RuntimeException('কয়েন ব্যবহার করতে কমপক্ষে '.(int) $s->min_balance_to_redeem.' কয়েন লাগবে।');
        }

        $subtotal = (float) $order->subtotal - (float) ($order->discount ?? 0);
        $maxCoins = $this->maxRedeemableFor($subtotal, $balance);

        if ($coins > $maxCoins) {
            throw new \RuntimeException('এই অর্ডারে সর্বোচ্চ '.$maxCoins.' কয়েন ব্যবহার করা যাবে।');
        }

        $discount = $this->coinsToTaka($coins);
        if ($discount <= 0) {
            throw new \RuntimeException('এই পরিমাণ কয়েনে কোনো ছাড় পাওয়া যাচ্ছে না।');
        }

        $row = $this->post($customerId, [
            'type' => 'redeem',
            'amount' => -$coins,
            'status' => 'consumed',
            'source_type' => 'order',
            'source_id' => $orderId,
            'order_id' => $orderId,
            'redeem_rate_used' => (int) $s->redeem_coins_per_taka,
            'idempotency_key' => "redeem:order:{$orderId}",
            'note' => 'চেকআউটে কয়েন ব্যবহার',
        ], ['available' => -$coins, 'lifetime_redeemed' => $coins]);

        if (! $row) {
            throw new \RuntimeException('এই অর্ডারে ইতিমধ্যে কয়েন ব্যবহার করা হয়েছে।');
        }

        $this->consumeLots($customerId, $coins);

        // অর্ডারের মোট টাকা সার্ভারেই আবার হিসাব হয়
        $newTotal = max(0, round(
            (float) $order->subtotal
            - (float) ($order->discount ?? 0)
            - $discount
            + (float) ($order->delivery_charge ?? 0),
            2
        ));

        DB::table('orders')->where('id', $orderId)->update([
            'coins_redeemed' => $coins,
            'coin_discount' => $discount,
            'total' => $newTotal,
            'updated_at' => now(),
        ]);

        return [
            'coins' => $coins,
            'discount' => $discount,
            'total' => $newTotal,
            'balance' => $this->balance($customerId),
        ];
    }

    /* ---------------------------------------------------------------- ফ্রি প্রোডাক্ট */

    /** চেকআউটে দেখানোর জন্য — কোন প্রোডাক্ট কত কয়েনে নেওয়া যাবে */
    public function rewardCatalog(?string $customerId = null): array
    {
        $s = $this->settings();
        if (! $this->isEnabled() || ! $s->allow_product_redeem) {
            return [];
        }

        $now = now();
        $rows = DB::table('coin_reward_catalog as c')
            ->join('products as p', 'p.id', '=', 'c.product_id')
            ->where('c.is_active', true)
            ->where('p.is_active', true)
            ->where(fn ($q) => $q->whereNull('c.starts_at')->orWhere('c.starts_at', '<=', $now))
            ->where(fn ($q) => $q->whereNull('c.ends_at')->orWhere('c.ends_at', '>=', $now))
            ->orderBy('c.sort_order')
            ->orderBy('c.coin_cost')
            ->get([
                'c.id', 'c.product_id', 'c.coin_cost', 'c.stock_limit', 'c.redeemed_count',
                'c.max_per_customer', 'p.name', 'p.name_bn', 'p.image_url', 'p.base_price',
                'p.sale_price', 'p.stock_quantity',
            ]);

        $balance = $customerId ? (int) DB::table('coin_balances')->where('customer_id', $customerId)->value('available') : 0;

        return $rows->map(function ($r) use ($balance, $customerId) {
            $remaining = $this->rewardRemainingStock($r);

            return [
                'id' => $r->id,
                'product_id' => $r->product_id,
                'name' => $r->name_bn ?: $r->name,
                'image_url' => $r->image_url,
                'value_taka' => (float) ($r->sale_price ?: $r->base_price),
                'coin_cost' => (int) $r->coin_cost,
                'remaining' => $remaining,
                'in_stock' => $remaining > 0,
                'affordable' => $balance >= (int) $r->coin_cost,
                'already_taken' => $customerId ? $this->rewardTakenCount($customerId, (string) $r->id) : 0,
                'max_per_customer' => $r->max_per_customer !== null ? (int) $r->max_per_customer : null,
            ];
        })->all();
    }

    private function rewardRemainingStock(object $row): int
    {
        $productStock = (int) ($row->stock_quantity ?? 0);

        if ($row->stock_limit === null) {
            return max(0, $productStock);
        }

        return max(0, min($productStock, (int) $row->stock_limit - (int) $row->redeemed_count));
    }

    private function rewardTakenCount(string $customerId, string $catalogId): int
    {
        return DB::table('coin_transactions')
            ->where('customer_id', $customerId)
            ->where('source_type', 'reward_product')
            ->where('source_id', $catalogId)
            ->where('status', '!=', 'reversed')
            ->count();
    }

    /**
     * কয়েন দিয়ে ফ্রি প্রোডাক্ট নেওয়া।
     *
     * ক্যাটালগ সারিটা আগে লক করা হয় — নাহলে দুজন কাস্টমার একই সময়ে শেষ
     * স্টকটা নিয়ে নিতে পারত। লকের ক্রম সবসময় ক্যাটালগ → ব্যালেন্স, উল্টোটা নয়।
     *
     * @throws \RuntimeException
     */
    public function redeemRewardProduct(string $customerId, string $orderId, string $catalogId): array
    {
        $s = $this->settings();

        if (! $this->isEnabled() || ! $s->allow_product_redeem) {
            throw new \RuntimeException('ফ্রি প্রোডাক্ট রিডিম এখন বন্ধ আছে।');
        }

        return DB::transaction(function () use ($customerId, $orderId, $catalogId) {
            $item = DB::table('coin_reward_catalog')->where('id', $catalogId)->lockForUpdate()->first();
            if (! $item || ! $item->is_active) {
                throw new \RuntimeException('এই রিওয়ার্ডটি আর পাওয়া যাচ্ছে না।');
            }

            $now = now();
            if (($item->starts_at && $now->lt($item->starts_at)) || ($item->ends_at && $now->gt($item->ends_at))) {
                throw new \RuntimeException('এই রিওয়ার্ডের সময়সীমা শেষ।');
            }

            $order = DB::table('orders')->where('id', $orderId)->first();
            if (! $order) {
                throw new \RuntimeException('অর্ডার খুঁজে পাওয়া যায়নি।');
            }
            if ((int) $order->reward_coins > 0) {
                throw new \RuntimeException('এই অর্ডারে ইতিমধ্যে ফ্রি প্রোডাক্ট নেওয়া হয়েছে।');
            }

            $product = DB::table('products')->where('id', $item->product_id)->first();
            if (! $product || ! $product->is_active) {
                throw new \RuntimeException('প্রোডাক্টটি আর পাওয়া যাচ্ছে না।');
            }

            $remaining = $this->rewardRemainingStock((object) array_merge((array) $item, [
                'stock_quantity' => $product->stock_quantity,
            ]));
            if ($remaining <= 0) {
                throw new \RuntimeException('এই রিওয়ার্ডের স্টক শেষ।');
            }

            if ($item->max_per_customer !== null
                && $this->rewardTakenCount($customerId, $catalogId) >= (int) $item->max_per_customer) {
                throw new \RuntimeException('এই রিওয়ার্ডটি আপনি সর্বোচ্চ সংখ্যকবার নিয়ে ফেলেছেন।');
            }

            $cost = (int) $item->coin_cost;
            $balance = (int) DB::table('coin_balances')->where('customer_id', $customerId)->value('available');
            if ($balance < $cost) {
                throw new \RuntimeException('পর্যাপ্ত কয়েন নেই। লাগবে '.$cost.' কয়েন।');
            }

            $posted = $this->post($customerId, [
                'type' => 'redeem',
                'amount' => -$cost,
                'status' => 'consumed',
                'source_type' => 'reward_product',
                'source_id' => $catalogId,
                'order_id' => $orderId,
                'redeem_rate_used' => (int) $this->settings()->redeem_coins_per_taka,
                'idempotency_key' => "reward:order:{$orderId}",
                'note' => 'কয়েন দিয়ে ফ্রি প্রোডাক্ট',
            ], ['available' => -$cost, 'lifetime_redeemed' => $cost]);

            if (! $posted) {
                throw new \RuntimeException('এই অর্ডারে ইতিমধ্যে ফ্রি প্রোডাক্ট নেওয়া হয়েছে।');
            }

            $this->consumeLots($customerId, $cost);

            // ফ্রি আইটেম সাধারণ order_item হিসেবেই যায় (দাম ০), তাই ইনভয়েস ও
            // কুরিয়ারের কোডে কোনো পরিবর্তন লাগে না
            DB::table('order_items')->insert([
                'id' => (string) Str::uuid(),
                'order_id' => $orderId,
                'product_id' => $item->product_id,
                'product_name' => ($product->name_bn ?: $product->name).' (ফ্রি — কয়েন রিডিম)',
                'product_image' => $product->image_url,
                'quantity' => 1,
                'price' => 0,
                'is_reward' => true,
                'reward_coins' => $cost,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('coin_reward_catalog')->where('id', $catalogId)->increment('redeemed_count');
            DB::table('orders')->where('id', $orderId)->update(['reward_coins' => $cost, 'updated_at' => now()]);

            return [
                'coins' => $cost,
                'product_name' => $product->name_bn ?: $product->name,
                'balance' => $this->balance($customerId),
            ];
        });
    }

    /* ---------------------------------------------------------------- admin */

    public function adjust(string $customerId, int $amount, string $note, ?string $adminId): ?array
    {
        if ($amount === 0) {
            throw new \RuntimeException('পরিমাণ শূন্য হতে পারবে না।');
        }

        if (trim($note) === '') {
            throw new \RuntimeException('কারণ লেখা বাধ্যতামূলক।');
        }

        $s = $this->settings();

        return $this->post($customerId, [
            'type' => 'adjust',
            'amount' => $amount,
            'status' => 'available',
            'source_type' => 'manual',
            'expires_at' => $amount > 0 && $s->expiry_months ? now()->addMonths((int) $s->expiry_months) : null,
            'idempotency_key' => 'adjust:'.Str::uuid(),
            'note' => $note,
            'created_by' => $adminId,
        ], $amount > 0
            ? ['available' => $amount, 'lifetime_earned' => $amount]
            : ['available' => $amount]);
    }

    /* ---------------------------------------------------------------- jobs */

    /** কুলিং পিরিয়ড শেষ হওয়া pending কয়েন খরচযোগ্য করা */
    public function mature(int $limit = 1000): int
    {
        $due = DB::table('coin_transactions')
            ->where('status', 'pending')
            ->where('available_at', '<=', now())
            ->limit($limit)
            ->get();

        $count = 0;
        foreach ($due as $tx) {
            $amount = (int) $tx->amount;

            DB::transaction(function () use ($tx, $amount) {
                $this->lockBalance((string) $tx->customer_id);

                $updated = DB::table('coin_transactions')
                    ->where('id', $tx->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'available', 'updated_at' => now()]);

                if ($updated) {
                    DB::table('coin_balances')->where('customer_id', $tx->customer_id)->update([
                        'pending' => DB::raw('pending - '.$amount),
                        'available' => DB::raw('available + '.$amount),
                        'lifetime_earned' => DB::raw('lifetime_earned + '.$amount),
                        'version' => DB::raw('version + 1'),
                        'updated_at' => now(),
                    ]);
                }
            });

            $count++;
        }

        return $count;
    }

    /** মেয়াদ শেষ হওয়া কয়েন বাদ দেওয়া — পুরনো লট আগে (FIFO) */
    public function expire(int $limit = 1000): int
    {
        $due = DB::table('coin_transactions')
            ->where('status', 'available')
            ->where('type', 'earn')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->whereRaw('amount > consumed')
            ->orderBy('expires_at')
            ->limit($limit)
            ->get();

        $count = 0;
        foreach ($due as $tx) {
            $remaining = (int) $tx->amount - (int) $tx->consumed;
            if ($remaining <= 0) {
                continue;
            }

            $customerId = (string) $tx->customer_id;
            $available = (int) DB::table('coin_balances')->where('customer_id', $customerId)->value('available');
            $expireAmount = max(0, min($remaining, $available));

            if ($expireAmount > 0) {
                $this->post($customerId, [
                    'type' => 'expire',
                    'amount' => -$expireAmount,
                    'status' => 'available',
                    'source_type' => 'expiry',
                    'reverses_id' => $tx->id,
                    'idempotency_key' => "expire:{$tx->id}",
                    'note' => 'মেয়াদ শেষ',
                ], ['available' => -$expireAmount, 'lifetime_expired' => $expireAmount]);
            }

            DB::table('coin_transactions')->where('id', $tx->id)->update([
                'status' => 'expired',
                'consumed' => (int) $tx->amount,
                'updated_at' => now(),
            ]);

            $count++;
        }

        return $count;
    }

    /* ---------------------------------------------------------------- internals */

    /** খরচ করা কয়েন পুরনো লট থেকে কাটা হয়, যাতে মেয়াদের হিসাব ঠিক থাকে */
    private function consumeLots(string $customerId, int $coins): void
    {
        $remaining = $coins;

        $lots = DB::table('coin_transactions')
            ->where('customer_id', $customerId)
            ->where('type', 'earn')
            ->where('status', 'available')
            ->whereRaw('amount > consumed')
            ->orderByRaw('expires_at IS NULL, expires_at ASC')
            ->orderBy('created_at')
            ->get();

        foreach ($lots as $lot) {
            if ($remaining <= 0) {
                break;
            }

            $free = (int) $lot->amount - (int) $lot->consumed;
            $take = min($free, $remaining);

            DB::table('coin_transactions')->where('id', $lot->id)->update([
                'consumed' => (int) $lot->consumed + $take,
                'updated_at' => now(),
            ]);

            $remaining -= $take;
        }
    }

    private function lockBalance(string $customerId): object
    {
        $row = DB::table('coin_balances')->where('customer_id', $customerId)->lockForUpdate()->first();

        if (! $row) {
            DB::table('coin_balances')->insertOrIgnore([
                'customer_id' => $customerId,
                'available' => 0,
                'pending' => 0,
                'lifetime_earned' => 0,
                'lifetime_redeemed' => 0,
                'lifetime_expired' => 0,
                'version' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $row = DB::table('coin_balances')->where('customer_id', $customerId)->lockForUpdate()->first();
        }

        return $row;
    }

    /**
     * একমাত্র লেখার পথ। একই ট্রানজেকশনে লেজার সারি + ব্যালেন্স আপডেট।
     * idempotency_key আগে থেকে থাকলে null ফেরত যায় (কাজ ইতিমধ্যে হয়ে গেছে)।
     */
    private function post(string $customerId, array $tx, array $deltas): ?array
    {
        return DB::transaction(function () use ($customerId, $tx, $deltas) {
            $balance = $this->lockBalance($customerId);

            $exists = DB::table('coin_transactions')->where('idempotency_key', $tx['idempotency_key'])->exists();
            if ($exists) {
                return null;
            }

            $newAvailable = (int) $balance->available + (int) ($deltas['available'] ?? 0);

            $row = array_merge([
                'id' => (string) Str::orderedUuid(),
                'customer_id' => $customerId,
                'balance_after' => $newAvailable,
                'consumed' => 0,
                'multiplier_applied' => 1.00,
                'created_at' => now(),
                'updated_at' => now(),
            ], $tx);

            try {
                DB::table('coin_transactions')->insert($row);
            } catch (QueryException $e) {
                // ইউনিক কী ভায়োলেশন = সমান্তরাল রিকোয়েস্ট আগেই কাজটা করে ফেলেছে
                if ((int) ($e->errorInfo[1] ?? 0) === 1062) {
                    return null;
                }
                throw $e;
            }

            DB::table('coin_balances')->where('customer_id', $customerId)->update([
                'available' => DB::raw('available + '.(int) ($deltas['available'] ?? 0)),
                'pending' => DB::raw('pending + '.(int) ($deltas['pending'] ?? 0)),
                'lifetime_earned' => DB::raw('lifetime_earned + '.(int) ($deltas['lifetime_earned'] ?? 0)),
                'lifetime_redeemed' => DB::raw('lifetime_redeemed + '.(int) ($deltas['lifetime_redeemed'] ?? 0)),
                'lifetime_expired' => DB::raw('lifetime_expired + '.(int) ($deltas['lifetime_expired'] ?? 0)),
                'version' => DB::raw('version + 1'),
                'updated_at' => now(),
            ]);

            return $row;
        });
    }
}
