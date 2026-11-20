<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('abandoned_carts', function (Blueprint $table) {
            $table->text('customer_address')->nullable()->after('customer_email');
            $table->text('delivery_area')->nullable()->after('customer_address');
            $table->decimal('delivery_charge', 10, 2)->default(0)->after('total');
            $table->text('payment_method')->nullable()->after('delivery_charge');
        });
    }

    public function down(): void
    {
        Schema::table('abandoned_carts', function (Blueprint $table) {
            $table->dropColumn(['customer_address', 'delivery_area', 'delivery_charge', 'payment_method']);
        });
    }
};
