<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->unique();
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable();
            }
        });

        Schema::create('user_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('user_id');
            $table->string('role')->default('user');
            $table->timestamps();
            $table->unique(['user_id', 'role']);
        });

        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('user_id')->unique();
            $table->text('full_name')->nullable();
            $table->text('phone')->nullable();
            $table->text('email')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->string('slug')->unique();
            $table->text('image_url')->nullable();
            $table->uuid('parent_id')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('show_in_navbar')->default(false);
            $table->boolean('show_on_home')->default(false);
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->text('logo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('colors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->text('hex_code')->nullable();
            $table->timestamps();
        });

        Schema::create('sizes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->decimal('base_price', 10, 2)->default(0);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->text('sku')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->uuid('category_id')->nullable();
            $table->uuid('brand_id')->nullable();
            $table->text('image_url')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->text('weight')->nullable();
            $table->text('unit')->nullable();
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->uuid('color_id')->nullable();
            $table->uuid('size_id')->nullable();
            $table->text('sku')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('order_statuses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name')->unique();
            $table->text('color')->default('#6b7280');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('order_number')->unique();
            $table->text('customer_name');
            $table->text('customer_phone');
            $table->text('customer_email')->nullable();
            $table->text('customer_address');
            $table->text('delivery_area');
            $table->uuid('status_id');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('delivery_charge', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->text('payment_method')->default('cod');
            $table->text('payment_status')->default('unpaid');
            $table->text('notes')->nullable();
            $table->string('user_id')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('product_id')->nullable();
            $table->text('product_name');
            $table->text('product_image')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('price', 10, 2);
            $table->text('variant_info')->nullable();
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->text('phone')->unique();
            $table->text('email')->nullable();
            $table->text('address')->nullable();
            $table->integer('total_orders')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->string('user_id')->nullable();
            $table->timestamps();
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group_name')->default('general');
            $table->timestamps();
        });

        foreach (['shipping_charges', 'banner_categories', 'banners', 'pages', 'social_media', 'tracking_pixels', 'coupons', 'abandoned_carts'] as $name) {
            $this->{'create'.str_replace(' ', '', ucwords(str_replace('_', ' ', $name)))}();
        }
    }

    private function createShippingCharges(): void
    {
        Schema::create('shipping_charges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('area_name');
            $table->decimal('charge', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createBannerCategories(): void
    {
        Schema::create('banner_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    private function createBanners(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('title')->nullable();
            $table->text('image_url');
            $table->text('redirect_url')->nullable();
            $table->uuid('category_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    private function createPages(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('title');
            $table->string('slug')->unique();
            $table->longText('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createSocialMedia(): void
    {
        Schema::create('social_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('platform');
            $table->text('url');
            $table->text('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    private function createTrackingPixels(): void
    {
        Schema::create('tracking_pixels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('name');
            $table->text('type');
            $table->text('pixel_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createCoupons(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('discount_type')->default('percentage');
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->decimal('min_order_amount', 10, 2)->default(0);
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    private function createAbandonedCarts(): void
    {
        Schema::create('abandoned_carts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('customer_phone')->nullable();
            $table->text('customer_name')->nullable();
            $table->text('customer_email')->nullable();
            $table->json('items')->nullable();
            $table->decimal('total', 10, 2)->default(0);
            $table->boolean('recovered')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (array_reverse([
            'abandoned_carts', 'coupons', 'tracking_pixels', 'social_media', 'pages', 'banners',
            'banner_categories', 'shipping_charges', 'site_settings', 'customers', 'order_items',
            'orders', 'order_statuses', 'product_variants', 'products', 'sizes', 'colors', 'brands',
            'categories', 'profiles', 'user_roles',
        ]) as $table) {
            Schema::dropIfExists($table);
        }
    }
};
