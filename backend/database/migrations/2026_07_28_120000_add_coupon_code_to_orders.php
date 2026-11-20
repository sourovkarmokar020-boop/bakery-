<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * কোন অর্ডারে কোন কুপন বসেছে সেটা রাখা হয় — টাকার অঙ্ক আগে থেকেই
     * `discount` কলামে যায়, এখানে শুধু কোডটা যাতে অ্যাডমিন প্যানেলে
     * দেখা যায় এবং একই অর্ডারে দুইবার কুপন বসানো আটকানো যায়।
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('discount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('coupon_code');
        });
    }
};
