<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $indexes = [
        ['categories', ['is_active', 'show_on_home', 'sort_order'], 'categories_home_active_sort_idx'],
        ['categories', ['is_active', 'show_in_navbar', 'sort_order'], 'categories_nav_active_sort_idx'],
        ['categories', ['parent_id'], 'categories_parent_idx'],

        ['products', ['is_active', 'category_id', 'created_at'], 'products_active_category_created_idx'],
        ['products', ['is_active', 'is_featured', 'created_at'], 'products_active_featured_created_idx'],
        ['products', ['category_id'], 'products_category_idx'],
        ['products', ['brand_id'], 'products_brand_idx'],

        ['product_variants', ['product_id', 'is_active', 'created_at'], 'variants_product_active_created_idx'],
        ['product_variants', ['size_id'], 'variants_size_idx'],
        ['product_variants', ['color_id'], 'variants_color_idx'],

        ['orders', ['status_id', 'created_at'], 'orders_status_created_idx'],
        ['orders', ['user_id'], 'orders_user_idx'],
        ['order_items', ['order_id'], 'order_items_order_idx'],
        ['order_items', ['product_id'], 'order_items_product_idx'],

        ['site_settings', ['group_name'], 'site_settings_group_idx'],
        ['banners', ['category_id', 'is_active', 'sort_order'], 'banners_category_active_sort_idx'],
        ['banners', ['is_active', 'sort_order'], 'banners_active_sort_idx'],
        ['pages', ['is_active'], 'pages_active_idx'],
        ['shipping_charges', ['is_active'], 'shipping_charges_active_idx'],
        ['coupons', ['is_active', 'expires_at'], 'coupons_active_expires_idx'],
        ['abandoned_carts', ['recovered', 'created_at'], 'abandoned_carts_recovered_created_idx'],
    ];

    public function up(): void
    {
        foreach ($this->indexes as [$table, $columns, $name]) {
            $this->addIndex($table, $columns, $name);
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->indexes) as [$table, , $name]) {
            $this->dropIndex($table, $name);
        }
    }

    private function addIndex(string $table, array $columns, string $name): void
    {
        if (! Schema::hasTable($table) || $this->indexExists($table, $name)) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($columns, $name) {
            $blueprint->index($columns, $name);
        });
    }

    private function dropIndex(string $table, string $name): void
    {
        if (! Schema::hasTable($table) || ! $this->indexExists($table, $name)) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($name) {
            $blueprint->dropIndex($name);
        });
    }

    private function indexExists(string $table, string $name): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(fn (array $index) => ($index['name'] ?? null) === $name);
    }
};
