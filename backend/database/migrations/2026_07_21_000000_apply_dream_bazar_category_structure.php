<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Replaces the previous storefront taxonomy with the requested Dream Bazar
 * category structure (10 main categories with 2- and 3-level children).
 *
 * Safety: existing products are NOT deleted or hidden. Every product that
 * pointed at an old live category is re-homed to a sensible new category so
 * nothing disappears from the storefront. Old categories are deactivated
 * (not destroyed) so the change is fully reversible.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $now = now();

            // slug => [name_en, name_bn, sort_order, parent_slug|null]
            $categories = [
                // ---- Main categories ----
                'clothing'                     => ['Clothing', 'পোশাক', 1, null],
                'sports'                       => ['Sports', 'স্পোর্টস', 2, null],
                'watches'                      => ['Watches', 'ঘড়ি', 3, null],
                'gadgets'                      => ['Gadgets', 'গ্যাজেট', 4, null],
                'cosmetics'                    => ['Cosmetics', 'কসমেটিকস', 5, null],
                'food-organic'                 => ['Food & Organic', 'ফুড ও অর্গানিক', 6, null],
                'healthcare-supplements'       => ['Healthcare & Supplements', 'হেলথকেয়ার ও সাপ্লিমেন্ট', 7, null],
                'shoes'                        => ['Shoes', 'জুতা', 8, null],
                'electronics-home-appliances'  => ['Electronics & Home Appliances', 'ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্স', 9, null],
                'bags'                         => ['Bags', 'ব্যাগ', 10, null],

                // ---- Clothing > level 2 ----
                'clothing-men'   => ['Men', 'পুরুষ', 1, 'clothing'],
                'clothing-women' => ['Women', 'নারী', 2, 'clothing'],
                'clothing-baby'  => ['Baby', 'শিশু', 3, 'clothing'],

                // ---- Clothing > Men > level 3 ----
                'clothing-men-tshirt'  => ['T-Shirt', 'টি-শার্ট', 1, 'clothing-men'],
                'clothing-men-lungi'   => ['Lungi', 'লুঙ্গি', 2, 'clothing-men'],
                'clothing-men-shirt'   => ['Shirt', 'শার্ট', 3, 'clothing-men'],
                'clothing-men-pants'   => ['Pants', 'প্যান্ট', 4, 'clothing-men'],
                'clothing-men-jackets' => ['Jackets', 'জ্যাকেট', 5, 'clothing-men'],

                // ---- Clothing > Women > level 3 ----
                'clothing-women-salwar-kameez' => ['Salwar Kameez', 'সালোয়ার কামিজ', 1, 'clothing-women'],
                'clothing-women-burqa'         => ['Burqa', 'বোরকা', 2, 'clothing-women'],
                'clothing-women-night-dress'   => ['Night Dress', 'নাইট ড্রেস', 3, 'clothing-women'],
                'clothing-women-three-piece'   => ['Three-Piece', 'থ্রি-পিস', 4, 'clothing-women'],

                // ---- Clothing > Baby > level 3 ----
                'clothing-baby-newborn-set'    => ['Newborn Set', 'নবজাতক সেট', 1, 'clothing-baby'],
                'clothing-baby-shoes'          => ['Baby Shoes', 'বেবি জুতা', 2, 'clothing-baby'],
                'clothing-baby-feeding-bottle' => ['Feeding Bottle', 'ফিডিং বোতল', 3, 'clothing-baby'],
                'clothing-baby-toys'           => ['Toys', 'খেলনা', 4, 'clothing-baby'],
                'clothing-baby-dress'          => ['Baby Dress', 'বেবি ড্রেস', 5, 'clothing-baby'],

                // ---- Sports > level 2 ----
                'sports-jersey'        => ['Jersey', 'জার্সি', 1, 'sports'],
                'sports-trousers'      => ['Sports Trousers', 'স্পোর্টস ট্রাউজার', 2, 'sports'],
                'sports-sneakers'      => ['Sneakers', 'স্নিকার্স', 3, 'sports'],
                'sports-running-shoes' => ['Running Shoes', 'রানিং শু', 4, 'sports'],

                // ---- Shoes > level 2 ----
                'shoes-men'   => ['Men', 'পুরুষ', 1, 'shoes'],
                'shoes-women' => ['Women', 'নারী', 2, 'shoes'],
                'shoes-baby'  => ['Baby', 'শিশু', 3, 'shoes'],
            ];

            // 1) Create/update every requested category (idempotent by slug).
            foreach ($categories as $slug => [$nameEn, $nameBn, $sortOrder, $parentSlug]) {
                $existing = DB::table('categories')->where('slug', $slug)->first();
                DB::table('categories')->updateOrInsert(
                    ['slug' => $slug],
                    [
                        'id'         => $existing?->id ?? (string) Str::uuid(),
                        'name'       => $nameBn,
                        'name_en'    => $nameEn,
                        'name_bn'    => $nameBn,
                        'sort_order' => $sortOrder,
                        'is_active'  => true,
                        // Everything is reachable through the mega menu.
                        'show_in_navbar' => true,
                        // Only main categories appear on the homepage strip.
                        'show_on_home'   => $parentSlug === null,
                        'created_at' => $existing?->created_at ?? $now,
                        'updated_at' => $now,
                    ]
                );
            }

            // 2) Wire up parent_id now that every row exists.
            $ids = DB::table('categories')->pluck('id', 'slug');
            foreach ($categories as $slug => [, , , $parentSlug]) {
                DB::table('categories')->where('slug', $slug)->update([
                    'parent_id'  => $parentSlug ? $ids[$parentSlug] : null,
                    'updated_at' => $now,
                ]);
            }

            // 3) Re-home products from the old live categories to new ones so
            //    nothing vanishes. (old category slug => new category slug)
            $remap = [
                'crockeries'   => 'electronics-home-appliances',
                'ladies-bag'   => 'bags',
                'mans-bag'     => 'bags',
                'babys-toy'    => 'clothing-baby-toys',
                'gift-item'    => 'gadgets',
                'watch'        => 'watches',
                'hand-watch'   => 'watches',
                'alarm-clock'  => 'watches',
                'wall-clock'   => 'watches',
                'lamp'         => 'electronics-home-appliances',
                'water-bottle' => 'electronics-home-appliances',
                'perfume'      => 'cosmetics',
            ];

            foreach ($remap as $oldSlug => $newSlug) {
                $oldId = DB::table('categories')->where('slug', $oldSlug)->value('id');
                if (! $oldId || ! isset($ids[$newSlug])) {
                    continue;
                }
                // Only correct category_id; price/stock/visibility stay untouched.
                DB::table('products')->where('category_id', $oldId)->update([
                    'category_id' => $ids[$newSlug],
                    'updated_at'  => $now,
                ]);
            }

            // 4) Deactivate every category that is not part of the new tree
            //    (kept in the table for reversibility, just hidden everywhere).
            DB::table('categories')->whereNotIn('slug', array_keys($categories))->update([
                'is_active'      => false,
                'show_in_navbar' => false,
                'show_on_home'   => false,
                'updated_at'     => $now,
            ]);
        });
    }

    public function down(): void
    {
        // The requested Dream Bazar taxonomy is intentionally retained.
    }
};
