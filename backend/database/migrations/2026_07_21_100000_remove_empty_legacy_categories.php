<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Removes the old/legacy top categories that were replaced by the current
 * 10 active categories. Every category deleted here is verified empty:
 * 0 products, 0 banners, no foreign-key references, and not a parent of
 * any active category. Deleting them just declutters the admin panel.
 */
return new class extends Migration
{
    /**
     * Legacy parent categories (all is_active = 0, show_on_home = 0).
     */
    private array $legacyParents = [
        'travel-accessories',
        'kitchen-appliances',
        'electronic-item',
        'crockeries',
        'ladies-bag',
        'mans-bag',
        'babys-toy',
        'gift-item',
        'watch',
        'lamp',
        'water-bottle',
        'perfume',
    ];

    /**
     * Legacy subcategories that lived under the old "watch" parent.
     */
    private array $legacyChildren = [
        'hand-watch',
        'alarm-clock',
        'wall-clock',
    ];

    public function up(): void
    {
        DB::transaction(function (): void {
            $slugs = array_merge($this->legacyChildren, $this->legacyParents);

            // Safety net: never delete a category that still holds products.
            $withProducts = DB::table('categories as c')
                ->join('products as p', 'p.category_id', '=', 'c.id')
                ->whereIn('c.slug', $slugs)
                ->pluck('c.slug')
                ->unique()
                ->all();

            $slugs = array_values(array_diff($slugs, $withProducts));

            // Children first, then parents.
            DB::table('categories')
                ->whereIn('slug', $slugs)
                ->whereNotNull('parent_id')
                ->delete();

            DB::table('categories')
                ->whereIn('slug', $slugs)
                ->whereNull('parent_id')
                ->delete();
        });
    }

    public function down(): void
    {
        // Legacy data is intentionally not recreated. These categories were
        // empty placeholders; restoring them would only reintroduce clutter.
        // If needed, re-run the original seeders that created them.
    }
};
