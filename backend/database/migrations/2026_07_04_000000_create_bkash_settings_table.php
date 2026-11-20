<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bkash_settings', function (Blueprint $table) {
            $table->id();
            $table->string('app_key')->nullable();
            $table->string('app_secret')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('mode')->default('sandbox'); // sandbox | live
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        if (! Schema::hasColumn('orders', 'bkash_payment_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('bkash_payment_id')->nullable()->index();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('bkash_settings');

        if (Schema::hasColumn('orders', 'bkash_payment_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('bkash_payment_id');
            });
        }
    }
};
