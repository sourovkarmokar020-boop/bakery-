<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $categories = [
            [
                'slug' => 'electronic-item',
                'name' => 'ইলেকট্রনিক আইটেম',
                'name_en' => 'Electronic Item',
                'name_bn' => 'ইলেকট্রনিক আইটেম',
                'sort_order' => 10,
            ],
            [
                'slug' => 'kitchen-appliances',
                'name' => 'কিচেন অ্যাপ্লায়েন্স',
                'name_en' => 'Kitchen Appliances',
                'name_bn' => 'কিচেন অ্যাপ্লায়েন্স',
                'sort_order' => 11,
            ],
            [
                'slug' => 'travel-accessories',
                'name' => 'ট্রাভেল অ্যাক্সেসরিজ',
                'name_en' => 'Travel Accessories',
                'name_bn' => 'ট্রাভেল অ্যাক্সেসরিজ',
                'sort_order' => 12,
            ],
        ];

        foreach ($categories as $category) {
            $existing = DB::table('categories')->where('slug', $category['slug'])->first();
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                [
                    'id' => $existing?->id ?? (string) Str::uuid(),
                    'name' => $category['name'],
                    'name_en' => $category['name_en'],
                    'name_bn' => $category['name_bn'],
                    'parent_id' => null,
                    'sort_order' => $category['sort_order'],
                    'is_active' => true,
                    'show_in_navbar' => true,
                    'show_on_home' => true,
                    'created_at' => $existing?->created_at ?? $now,
                    'updated_at' => $now,
                ]
            );
        }

        $categoryIds = DB::table('categories')->pluck('id', 'slug');
        $assignments = [
            'electronic-item' => [
                'jd-303-rechargeable-green-laser-pointer-kit-1784449625642',
                'foldable-mini-hand-fan-with-digital-display-1783601730049',
                'disney-lotso-portable-mini-hand-fan-1200mah-1783602024776',
                'smart-scalp-massager',
                'masoor-dal-1kg',
            ],
            'kitchen-appliances' => [
                'electric-grinder-950w',
                'electric-meat-grinder-1500w',
                'nima-2-in-1-electric-blender',
                'olive-oil-500ml',
                'pure-yogurt-500g',
            ],
            'travel-accessories' => [
                'soft-u-shaped-travel-neck-pillow-1783602718421',
            ],
        ];

        foreach ($assignments as $categorySlug => $productSlugs) {
            DB::table('products')
                ->whereIn('slug', $productSlugs)
                ->update([
                    'category_id' => $categoryIds[$categorySlug],
                    'is_active' => true,
                    'updated_at' => $now,
                ]);
        }

        DB::table('products')
            ->where('id', '0b819496-0cf3-4a08-820d-613220cf737b')
            ->update([
                'image_url' => '/assets/uploads/product-images/wall-clock-product.png',
                'updated_at' => $now,
            ]);
    }

    public function down(): void
    {
        // Product/category corrections are intentionally retained to avoid hiding
        // valid catalog items or restoring the incorrect wall-clock image.
    }
};
