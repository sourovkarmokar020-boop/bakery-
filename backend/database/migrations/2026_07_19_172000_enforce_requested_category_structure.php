<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $mainSlugs = [
            'crockeries', 'ladies-bag', 'mans-bag', 'babys-toy', 'gift-item',
            'watch', 'lamp', 'water-bottle', 'perfume',
        ];
        $watchSubSlugs = ['hand-watch', 'alarm-clock', 'wall-clock'];
        $allowedSlugs = [...$mainSlugs, ...$watchSubSlugs];

        DB::table('categories')->whereIn('slug', $mainSlugs)->update([
            'parent_id' => null,
            'is_active' => true,
            'show_in_navbar' => true,
            'show_on_home' => true,
            'updated_at' => $now,
        ]);

        $watchId = DB::table('categories')->where('slug', 'watch')->value('id');
        DB::table('categories')->whereIn('slug', $watchSubSlugs)->update([
            'parent_id' => $watchId,
            'is_active' => true,
            'show_in_navbar' => true,
            'show_on_home' => false,
            'updated_at' => $now,
        ]);

        DB::table('categories')->whereNotIn('slug', $allowedSlugs)->update([
            'is_active' => false,
            'show_in_navbar' => false,
            'show_on_home' => false,
            'updated_at' => $now,
        ]);

        $categoryImages = [
            'ladies-bag' => '/assets/uploads/category-images/ladies-bag.png',
            'mans-bag' => '/assets/uploads/category-images/mans-bag.png',
            'perfume' => '/assets/uploads/category-images/perfume.png',
        ];
        foreach ($categoryImages as $slug => $imageUrl) {
            DB::table('categories')->where('slug', $slug)->update([
                'image_url' => $imageUrl,
                'updated_at' => $now,
            ]);
        }

        $categoryIds = DB::table('categories')->pluck('id', 'slug');
        $assignments = [
            'gift-item' => [
                'jd-303-rechargeable-green-laser-pointer-kit-1784449625642',
                'foldable-mini-hand-fan-with-digital-display-1783601730049',
                'disney-lotso-portable-mini-hand-fan-1200mah-1783602024776',
                'smart-scalp-massager',
                'masoor-dal-1kg',
                'soft-u-shaped-travel-neck-pillow-1783602718421',
            ],
            'crockeries' => [
                'electric-grinder-950w',
                'electric-meat-grinder-1500w',
                'nima-2-in-1-electric-blender',
                'olive-oil-500ml',
                'pure-yogurt-500g',
            ],
        ];

        foreach ($assignments as $categorySlug => $productSlugs) {
            // Check if category exists before trying to assign products
            if (isset($categoryIds[$categorySlug])) {
                DB::table('products')->whereIn('slug', $productSlugs)->update([
                    'category_id' => $categoryIds[$categorySlug],
                    'is_active' => true,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // The requested storefront taxonomy is intentionally retained.
    }
};
