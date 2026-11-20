<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * কয়েন দিয়ে ফ্রি প্রোডাক্ট নেওয়ার ক্যাটালগ।
 *
 * এটি কয়েন-ছাড়ের (coin_discount) থেকে আলাদা পথ — ওটা টাকার হিসাব, এটা স্টকের।
 * দুটো মিশিয়ে ফেললে রিফান্ডের সময় "কত টাকা ফেরত, কোন জিনিস ফেরত" আলাদা করা
 * যেত না, তাই অর্ডারে দুটোর জন্য আলাদা কলাম রাখা হয়েছে।
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coin_reward_catalog', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');

            // অ্যাডমিন নিজে হাতে দাম বসায় — প্রোডাক্টের টাকার দাম থেকে অটো হিসাব
            // করা হয় না, যাতে কম মার্জিনের জিনিস ইচ্ছে করে বেশি কয়েনে রাখা যায়।
            $table->integer('coin_cost');

            // null = আলাদা সীমা নেই, প্রোডাক্টের নিজের স্টকই সীমা
            $table->integer('stock_limit')->nullable();
            $table->integer('redeemed_count')->default(0);
            $table->integer('max_per_customer')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
            $table->index('product_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            // ফ্রি আইটেম সাধারণ order_items হিসেবেই থাকে (price = 0), যাতে
            // ইনভয়েস, কুরিয়ার ও অর্ডার লিস্ট আলাদা কোড ছাড়াই কাজ করে
            $table->boolean('is_reward')->default(false)->after('variant_info');
            $table->integer('reward_coins')->default(0)->after('is_reward');
        });

        Schema::table('orders', function (Blueprint $table) {
            // কয়েন-ছাড়ে খরচ হওয়া কয়েন (coins_redeemed) থেকে আলাদা রাখা হয়,
            // যাতে একই অর্ডারে দুটোই করা যায় এবং হিসাব গুলিয়ে না যায়
            $table->integer('reward_coins')->default(0)->after('coin_discount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('reward_coins');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['is_reward', 'reward_coins']);
        });

        Schema::dropIfExists('coin_reward_catalog');
    }
};
