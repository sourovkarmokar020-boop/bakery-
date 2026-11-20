<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('customer_ip')->nullable()->after('user_id');
        });

        Schema::create('blocked_customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('customer_name')->nullable();
            $table->text('phone')->nullable();
            $table->text('ip_address')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocked_customers');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('customer_ip');
        });
    }
};
