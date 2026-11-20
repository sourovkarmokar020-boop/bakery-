<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('courier_settings')) {
            Schema::create('courier_settings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('provider')->unique();
                $table->boolean('enabled')->default(false);
                $table->text('api_key')->nullable();
                $table->text('secret_key')->nullable();
                $table->text('base_url')->default('https://portal.packzy.com/api/v1');
                $table->decimal('last_balance', 12, 2)->nullable();
                $table->timestamp('last_checked_at')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'courier_provider')) {
                $table->string('courier_provider')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'courier_status')) {
                $table->string('courier_status')->nullable()->after('courier_provider');
            }
            if (!Schema::hasColumn('orders', 'courier_tracking_code')) {
                $table->string('courier_tracking_code')->nullable()->after('courier_status');
            }
            if (!Schema::hasColumn('orders', 'courier_consignment_id')) {
                $table->string('courier_consignment_id')->nullable()->after('courier_tracking_code');
            }
            if (!Schema::hasColumn('orders', 'courier_order_id')) {
                $table->string('courier_order_id')->nullable()->after('courier_consignment_id');
            }
            if (!Schema::hasColumn('orders', 'courier_sent_at')) {
                $table->timestamp('courier_sent_at')->nullable()->after('courier_order_id');
            }
            if (!Schema::hasColumn('orders', 'courier_response')) {
                $table->json('courier_response')->nullable()->after('courier_sent_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            foreach ([
                'courier_response',
                'courier_sent_at',
                'courier_order_id',
                'courier_consignment_id',
                'courier_tracking_code',
                'courier_status',
                'courier_provider',
            ] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::dropIfExists('courier_settings');
    }
};
