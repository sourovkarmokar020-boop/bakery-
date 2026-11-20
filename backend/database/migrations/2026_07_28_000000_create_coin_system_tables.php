<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * কয়েন (লয়্যালটি) সিস্টেম।
 *
 * মূল নীতি: coin_transactions হলো সত্যের উৎস (append-only ledger) — কোনো সারি
 * কখনো UPDATE/DELETE হয় না, রিভার্স করতে হলে নতুন নেগেটিভ সারি যোগ হয়।
 * coin_balances শুধু ওই লেজারের ক্যাশ করা যোগফল, যাতে ব্যালেন্স দেখাতে
 * প্রতিবার SUM() করতে না হয়।
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coin_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // স্ক্রিনশটের তিনটি টগল
            $table->boolean('is_enabled')->default(false);
            $table->boolean('allow_checkout_redeem')->default(false);
            $table->boolean('allow_product_redeem')->default(false);

            // স্ক্রিনশটের দুটি রেট ফিল্ড
            $table->integer('earn_coins_per_100')->default(5);
            $table->integer('redeem_coins_per_taka')->default(100);

            // সীমা ও সুরক্ষা
            $table->decimal('min_order_to_earn', 10, 2)->default(0);
            $table->integer('max_coins_per_order')->nullable();
            $table->integer('min_balance_to_redeem')->default(0);
            $table->integer('max_redeem_percent')->default(100);
            $table->integer('expiry_months')->nullable();
            $table->integer('cooling_days')->default(0);
            $table->boolean('earn_on_discounted')->default(true);

            $table->timestamps();
        });

        Schema::create('coin_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('name_bn')->nullable();
            // লেভেল সবসময় lifetime_earned দিয়ে হিসাব হয় — current balance দিয়ে নয়।
            // নাহলে কয়েন খরচ করলেই কাস্টমার নিচের লেভেলে নেমে যেত।
            $table->integer('min_lifetime_coins')->default(0);
            $table->decimal('multiplier', 4, 2)->default(1.00);
            $table->string('icon')->nullable();
            $table->string('color')->default('#f59e0b');
            $table->text('benefits')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id');

            // earn | redeem | expire | adjust | reverse | refund_return | bonus
            $table->string('type', 20);
            // সাইনড: ধনাত্মক = জমা, ঋণাত্মক = খরচ। আলাদা direction কলাম নেই,
            // কারণ SUM(amount) নিজেই অর্থবহ হতে হবে।
            $table->integer('amount');
            $table->integer('balance_after')->default(0);
            // pending = জমা হয়েছে কিন্তু এখনো খরচযোগ্য নয় (ডেলিভারির অপেক্ষায়)
            $table->string('status', 20)->default('available');
            // শুধু earn সারির জন্য: এই লট থেকে কত কয়েন ইতিমধ্যে খরচ/মেয়াদোত্তীর্ণ হয়েছে।
            // `amount` কখনো বদলায় না — এটি আলাদা হিসাবরক্ষণ ফিল্ড, যাতে মেয়াদ শেষ
            // করার সময় পুরনো লট আগে (FIFO) ধরা যায়।
            $table->integer('consumed')->default(0);

            $table->string('source_type', 30)->nullable();
            $table->uuid('source_id')->nullable();
            $table->uuid('order_id')->nullable();

            $table->timestamp('available_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // রেট বদলালেও পুরনো সারি যেন নিজেকে ব্যাখ্যা করতে পারে
            $table->integer('earn_rate_used')->nullable();
            $table->integer('redeem_rate_used')->nullable();
            $table->decimal('multiplier_applied', 4, 2)->default(1.00);

            // ডুপ্লিকেট রিওয়ার্ড ঠেকানোর একমাত্র নির্ভরযোগ্য উপায় — ডাটাবেস কনস্ট্রেইন্ট।
            // অ্যাপ্লিকেশন লেভেলের চেক যথেষ্ট নয়, কারণ status hook দুবার ফায়ার করতেই পারে।
            $table->string('idempotency_key', 191)->unique();
            $table->uuid('reverses_id')->nullable();

            $table->text('note')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'created_at']);
            $table->index(['customer_id', 'status']);
            $table->index(['status', 'available_at']);
            $table->index(['status', 'expires_at']);
            $table->index('order_id');
        });

        Schema::create('coin_balances', function (Blueprint $table) {
            $table->uuid('customer_id')->primary();
            $table->integer('available')->default(0);
            $table->integer('pending')->default(0);
            $table->integer('lifetime_earned')->default(0);
            $table->integer('lifetime_redeemed')->default(0);
            $table->integer('lifetime_expired')->default(0);
            $table->integer('version')->default(0);
            $table->timestamps();
        });

        // অর্ডারে কয়েনের হিসাব আলাদা কলামে — বিদ্যমান `discount` কলামের সাথে
        // মিশিয়ে ফেললে রিফান্ড ও হিসাবরক্ষণে কুপন আর কয়েন আলাদা করা যেত না।
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('coins_earned')->default(0)->after('discount');
            $table->integer('coins_redeemed')->default(0)->after('coins_earned');
            $table->decimal('coin_discount', 10, 2)->default(0)->after('coins_redeemed');
        });

        // স্ট্যাটাসের নাম এডিটযোগ্য টেক্সট — নাম দেখে কয়েন দেওয়া বিপজ্জনক,
        // কারণ এডমিন "Completed" রিনেম করলেই পুরো রিওয়ার্ড ইঞ্জিন থেমে যেত।
        Schema::table('order_statuses', function (Blueprint $table) {
            $table->string('code')->nullable()->after('name');
            $table->boolean('is_coin_earning')->default(false)->after('code');
            $table->boolean('is_coin_reversing')->default(false)->after('is_coin_earning');
        });

        $this->seedDefaults();
    }

    private function seedDefaults(): void
    {
        $now = now();

        DB::table('coin_settings')->insert([
            'id' => (string) Str::uuid(),
            'is_enabled' => false,
            'allow_checkout_redeem' => false,
            'allow_product_redeem' => false,
            // ডিফল্ট = ১% রিটার্ন (১ টাকায় ১ কয়েন, ১০০ কয়েনে ১ টাকা)
            'earn_coins_per_100' => 100,
            'redeem_coins_per_taka' => 100,
            'min_order_to_earn' => 200,
            'max_coins_per_order' => 2000,
            'min_balance_to_redeem' => 200,
            'max_redeem_percent' => 20,
            'expiry_months' => 12,
            'cooling_days' => 7,
            'earn_on_discounted' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        foreach ([
            ['Bronze', 'ব্রোঞ্জ', 0, 1.00, '#cd7f32', 1],
            ['Silver', 'সিলভার', 5000, 1.25, '#9ca3af', 2],
            ['Gold', 'গোল্ড', 20000, 1.50, '#f59e0b', 3],
        ] as [$name, $nameBn, $min, $mult, $color, $sort]) {
            DB::table('coin_tiers')->insert([
                'id' => (string) Str::uuid(),
                'name' => $name,
                'name_bn' => $nameBn,
                'min_lifetime_coins' => $min,
                'multiplier' => $mult,
                'color' => $color,
                'sort_order' => $sort,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // বিদ্যমান স্ট্যাটাসগুলোকে স্থায়ী code দেওয়া হচ্ছে
        $codes = [
            'Pending' => 'pending',
            'Processing' => 'processing',
            'On The Way' => 'on_the_way',
            'On Hold' => 'on_hold',
            'In Courier' => 'in_courier',
            'Completed' => 'completed',
            'Cancelled' => 'cancelled',
            'Returned' => 'returned',
            'Refunded' => 'refunded',
        ];

        foreach ($codes as $name => $code) {
            DB::table('order_statuses')->where('name', $name)->update([
                'code' => $code,
                // ডেলিভারি হওয়ার পরেই কয়েন পাকা হয় — অর্ডার দেওয়ার সময় নয়।
                // COD বাজারে এটাই সবচেয়ে বড় ফ্রড সুরক্ষা।
                'is_coin_earning' => $code === 'completed',
                'is_coin_reversing' => in_array($code, ['cancelled', 'returned', 'refunded'], true),
            ]);
        }

        // যেসব স্ট্যাটাসের নাম উপরের তালিকায় নেই, তাদের code = slug
        DB::table('order_statuses')->whereNull('code')->get(['id', 'name'])->each(function ($row) {
            DB::table('order_statuses')->where('id', $row->id)->update([
                'code' => Str::slug($row->name, '_'),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('order_statuses', function (Blueprint $table) {
            $table->dropColumn(['code', 'is_coin_earning', 'is_coin_reversing']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['coins_earned', 'coins_redeemed', 'coin_discount']);
        });

        Schema::dropIfExists('coin_balances');
        Schema::dropIfExists('coin_transactions');
        Schema::dropIfExists('coin_tiers');
        Schema::dropIfExists('coin_settings');
    }
};
