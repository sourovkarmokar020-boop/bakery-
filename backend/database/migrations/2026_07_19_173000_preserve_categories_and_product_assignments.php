<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $now = now();
            $categories = [
                'crockeries' => ['Crockeries', 'ক্রোকারিজ', 1, null, '/assets/uploads/product-images/zW2AUevvenCBcqORoBbXYzvmDTHAEiaqVmgx440m.webp'],
                'ladies-bag' => ['Ladies Bag', 'লেডিস ব্যাগ', 2, null, '/assets/uploads/category-images/ladies-bag.png'],
                'mans-bag' => ['Mans Bag', 'মেনস ব্যাগ', 3, null, '/assets/uploads/category-images/mans-bag.png'],
                'babys-toy' => ['Babys Toy', 'বেবি টয়', 4, null, '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg'],
                'gift-item' => ['Gift Item', 'গিফট আইটেম', 5, null, '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u09.jpeg'],
                'watch' => ['Watch', 'ঘড়ি', 6, null, '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u18.jpeg'],
                'lamp' => ['Lamp', 'ল্যাম্প', 7, null, '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u03.jpeg'],
                'water-bottle' => ['Water Bottle', 'ওয়াটার বোতল', 8, null, '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u49.jpeg'],
                'perfume' => ['Perfume', 'পারফিউম', 9, null, '/assets/uploads/category-images/perfume.png'],
                'hand-watch' => ['Hand Watch', 'হাত ঘড়ি', 1, 'watch', '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u18.jpeg'],
                'alarm-clock' => ['Alarm Clock', 'অ্যালার্ম ক্লক', 2, 'watch', '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u24.jpeg'],
                'wall-clock' => ['Wall Clock', 'ওয়াল ক্লক', 3, 'watch', '/assets/uploads/product-images/wall-clock-product.png'],
            ];

            // Create missing requested categories without replacing existing records.
            foreach ($categories as $slug => [$nameEn, $nameBn, $sortOrder, $parentSlug, $imageUrl]) {
                $existing = DB::table('categories')->where('slug', $slug)->first();
                DB::table('categories')->updateOrInsert(
                    ['slug' => $slug],
                    [
                        'id' => $existing?->id ?? (string) Str::uuid(),
                        'name' => $nameEn,
                        'name_en' => $nameEn,
                        'name_bn' => $nameBn,
                        'image_url' => $imageUrl,
                        'sort_order' => $sortOrder,
                        'is_active' => true,
                        'show_in_navbar' => true,
                        'show_on_home' => $parentSlug === null,
                        'created_at' => $existing?->created_at ?? $now,
                        'updated_at' => $now,
                    ]
                );
            }

            $categoryIds = DB::table('categories')->pluck('id', 'slug');
            foreach ($categories as $slug => [, , , $parentSlug]) {
                DB::table('categories')->where('slug', $slug)->update([
                    'parent_id' => $parentSlug ? $categoryIds[$parentSlug] : null,
                    'updated_at' => $now,
                ]);
            }

            DB::table('categories')->whereNotIn('slug', array_keys($categories))->update([
                'is_active' => false,
                'show_in_navbar' => false,
                'show_on_home' => false,
                'updated_at' => $now,
            ]);

            $assignments = [
                'crockeries' => [
                    'electric-grinder-950w', 'electric-meat-grinder-1500w',
                    'nima-2-in-1-electric-blender', 'olive-oil-500ml', 'pure-yogurt-500g',
                    'coriander-powder-150g', 'almond-oil-100ml', 'quinoa-200g', 'flax-seeds-200g',
                ],
                'babys-toy' => [
                    'automatic-bubble-gun', 'only-you-teddy-bear', 'cute-lion-plush-toy',
                    'green-superhero-plush-toy', 'kids-balance-bike', 'dancing-cactus-musical-toy',
                    'pineapple-rabbit-plush-toy', 'pixel-world-building-block-set',
                    'bow-deer-plush-toy', 'shield-hero-plush-toy',
                ],
                'gift-item' => [
                    'jd-303-rechargeable-green-laser-pointer-kit-1784449625642', 'miniket-rice-5kg',
                    'allah-muhammad-crystal-showpiece', 'iridescent-drip-led-candle',
                    'kaaba-dua-crystal-frame', 'disney-lotso-portable-mini-hand-fan-1200mah-1783602024776',
                    'chinigura-rice-5kg', 'colorful-crystal-led-candle-light-1783601190464',
                    'decorative-crystal-perfume-bottle', 'taj-mahal-crystal-showpiece',
                    'masoor-dal-1kg', '-----1783601343786', 'black-ship-crystal-showpiece',
                    'vintage-bicycle-candle-holder', 'pistachio-200g', 'ajwa-dates-500g',
                    'foldable-mini-hand-fan-with-digital-display-1783601730049',
                    'ribbed-crystal-led-candle', 'liquid-sailing-boat-showpiece',
                    'lotus-crystal-led-candle', 'soft-u-shaped-travel-neck-pillow-1783602718421',
                    'black-seed-oil-100ml', 'smart-scalp-massager', 'mabroom-dates-500g',
                ],
                'hand-watch' => [
                    'patali-gur-1kg', 'turmeric-powder-200g', 'coconut-oil-500ml',
                    'man-watch-1783600536177', 'nolen-gur-500g', 'moong-dal-1kg',
                    'litchi-honey-1kg', 'man-watch-1783600365902', 'mustard-honey-1kg',
                    'flaxseed-oil-100ml',
                ],
                'alarm-clock' => [
                    'mustard-oil-500ml', 'chia-seeds-200g', 'table-clock-1783600760738',
                    'classic-twin-bell-alarm-clock', 'sundarbans-honey-500g', 'cumin-powder-150g',
                ],
                'wall-clock' => ['date-molasses-500g'],
                'lamp' => [
                    'cute-pink-cartoon-mini-desk-lamp-1783601497896', 'cartoon-clock-desk-lamp',
                    'tulip-glass-dome-night-lamp', 'rabbit-flower-desk-lamp',
                    'best-friend-moon-led-gift-lamp', 'chili-powder-200g',
                    'love-couple-led-gift-lamp', 'happy-every-day-moon-lamp',
                ],
                'water-bottle' => ['icy-pro-stainless-steel-water-bottle-1783602526846'],
            ];

            // Only correct category_id; product visibility and all other product data stay untouched.
            foreach ($assignments as $categorySlug => $productSlugs) {
                DB::table('products')->whereIn('slug', $productSlugs)->update([
                    'category_id' => $categoryIds[$categorySlug],
                    'updated_at' => $now,
                ]);
            }
        });
    }

    public function down(): void
    {
        // Catalog taxonomy corrections are intentionally retained.
    }
};
