<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Tops up the four homepage rows that were still short of the four-column grid:
 *
 *  - Healthcare & Supplements  2 -> 4  (two new products)
 *  - Gadgets                   3 -> 4  (one new product)
 *  - Watches                   3 -> 4  (one new product)
 *  - অফারে কিনুন / Special Offers      (the new watch is also flagged featured)
 *
 * Every other category is left untouched on purpose.
 *
 * The featured row gets its extra product by promoting the watch inserted here
 * rather than by creating a fifth product somewhere, so no other category page
 * ends up with a half-empty row as a side effect.
 *
 * Images point at photos that were already uploaded to
 * `storage/app/public/uploads/product-images` but were not attached to any
 * product yet — that way the new cards show a real photo instead of the
 * placeholder.
 */
return new class extends Migration
{
    /**
     * category slug => [blurb_en, blurb_bn, items[ [name_en, name_bn, base, sale, stock, image, featured] ]]
     */
    private function catalog(): array
    {
        return [
            'healthcare-supplements' => [
                'blurb_en' => 'Authentic health care item with a readable batch and expiry date on every pack.',
                'blurb_bn' => 'আসল হেলথ কেয়ার পণ্য, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।',
                'items' => [
                    [
                        'Smart Electric Scalp Massager',
                        'স্মার্ট ইলেকট্রিক স্ক্যাল্প ম্যাসাজার',
                        1450, 1190, 30,
                        'fjbWlw8dy1518PS4Y2DSmKnnuVtUBUtF3zbYNtSm.webp',
                        false,
                    ],
                    [
                        'Memory Foam Neck Support Pillow',
                        'মেমোরি ফোম নেক সাপোর্ট পিলো',
                        950, 790, 40,
                        'woSzZTmPZl26HBPJnN6bGsSwgVjpDIHDkKmT2blz.webp',
                        false,
                    ],
                ],
            ],

            'gadgets' => [
                'blurb_en' => 'Handy everyday gadget with reliable build quality and a standard warranty.',
                'blurb_bn' => 'নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টিসহ।',
                'items' => [
                    [
                        'Mini Handheld Rechargeable Fan 1200mAh',
                        'মিনি হ্যান্ডহেল্ড রিচার্জেবল ফ্যান ১২০০ এমএএইচ',
                        1150, 990, 35,
                        'rr6dMCiSa5HHPZ8dE4RLYZbhbpUz9vHWjfeHjqqr.webp',
                        false,
                    ],
                ],
            ],

            'watches' => [
                'blurb_en' => 'Everyday wristwatch with a reliable movement and a comfortable strap. Backed by a service warranty.',
                'blurb_bn' => 'নির্ভরযোগ্য মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের দৈনন্দিন হাতঘড়ি। সার্ভিস ওয়ারেন্টিসহ।',
                'items' => [
                    [
                        "Men's Golden Skeleton Dial Watch",
                        'পুরুষদের গোল্ডেন স্কেলিটন ডায়াল ঘড়ি',
                        3450, 2950, 22,
                        'hvHXF8nmLPgkjqs8TAnWzI38hbfuE60rPCjGqQis.webp',
                        true, // also fills the last free slot of the Special Offers row
                    ],
                ],
            ],
        ];
    }

    public function up(): void
    {
        DB::transaction(function () {
            foreach ($this->catalog() as $categorySlug => $group) {
                $category = DB::table('categories')->where('slug', $categorySlug)->first();

                if (!$category) {
                    continue;
                }

                foreach ($group['items'] as [$nameEn, $nameBn, $basePrice, $salePrice, $stock, $image, $featured]) {
                    $slug = Str::slug($nameEn);

                    // Running the migration twice must not duplicate the row.
                    if (DB::table('products')->where('slug', $slug)->exists()) {
                        continue;
                    }

                    $imageUrl = asset('storage/uploads/product-images/'.$image);
                    $descriptionEn = $nameEn.'. '.$group['blurb_en'];
                    $descriptionBn = $nameBn.'। '.$group['blurb_bn'];

                    DB::table('products')->insert([
                        'id' => (string) Str::uuid(),
                        'name' => $nameBn,
                        'name_en' => $nameEn,
                        'name_bn' => $nameBn,
                        'slug' => $slug,
                        'short_description' => $group['blurb_bn'],
                        'short_description_en' => $group['blurb_en'],
                        'short_description_bn' => $group['blurb_bn'],
                        'description' => $descriptionBn,
                        'description_en' => $descriptionEn,
                        'description_bn' => $descriptionBn,
                        'base_price' => $basePrice,
                        'sale_price' => $salePrice,
                        'stock_quantity' => $stock,
                        'category_id' => $category->id,
                        'image_url' => $imageUrl,
                        'images' => json_encode([$imageUrl]),
                        'is_featured' => $featured,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        Cache::forget('storefront_home_data_v3');
    }

    public function down(): void
    {
        $slugs = [];

        foreach ($this->catalog() as $group) {
            foreach ($group['items'] as $item) {
                $slugs[] = Str::slug($item[0]);
            }
        }

        DB::table('products')->whereIn('slug', $slugs)->delete();

        Cache::forget('storefront_home_data_v3');
    }
};
