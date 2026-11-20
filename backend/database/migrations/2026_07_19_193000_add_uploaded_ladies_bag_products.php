<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $categoryId = DB::table('categories')->where('slug', 'ladies-bag')->value('id');

        if (! $categoryId) {
            return;
        }

        $now = now();
        $products = [
            [
                'id' => 'b3000000-0000-4000-8000-000000000001',
                'slug' => 'large-canvas-everyday-tote-bag',
                'name_en' => 'Large Canvas Everyday Tote Bag',
                'name_bn' => 'লার্জ ক্যানভাস এভরিডে টোট ব্যাগ',
                'short_en' => 'A roomy canvas tote with comfortable brown shoulder handles.',
                'short_bn' => 'আরামদায়ক ব্রাউন শোল্ডার হ্যান্ডেলসহ প্রশস্ত ক্যানভাস টোট ব্যাগ।',
                'description_en' => 'A lightweight and spacious everyday tote with a neutral canvas body, contrasting trim and long handles for comfortable carrying.',
                'description_bn' => 'নিউট্রাল ক্যানভাস বডি, কনট্রাস্ট ট্রিম ও আরামদায়ক লং হ্যান্ডেলসহ হালকা এবং প্রশস্ত দৈনন্দিন টোট ব্যাগ।',
                'base_price' => 1290,
                'sale_price' => 1090,
                'purchase_price' => 740,
                'sku' => 'FM-LB-003',
                'stock' => 20,
                'image' => '/assets/uploads/product-images/ladies-bag/large-canvas-everyday-tote-bag.webp',
                'featured' => true,
            ],
            [
                'id' => 'b3000000-0000-4000-8000-000000000002',
                'slug' => 'classic-brown-monogram-handbag',
                'name_en' => 'Classic Brown Monogram Handbag',
                'name_bn' => 'ক্লাসিক ব্রাউন মনোগ্রাম হ্যান্ডব্যাগ',
                'short_en' => 'Structured brown handbag with a detachable shoulder strap.',
                'short_bn' => 'ডিট্যাচেবল শোল্ডার স্ট্র্যাপসহ স্ট্রাকচার্ড ব্রাউন হ্যান্ডব্যাগ।',
                'description_en' => 'An elegant top-handle handbag featuring a patterned body, secure metal clasp and a detachable strap for versatile styling.',
                'description_bn' => 'প্যাটার্নড বডি, সিকিউর মেটাল ক্ল্যাস্প ও বহুমুখী ব্যবহারের ডিট্যাচেবল স্ট্র্যাপসহ এলিগ্যান্ট টপ-হ্যান্ডেল ব্যাগ।',
                'base_price' => 1850,
                'sale_price' => 1590,
                'purchase_price' => 1080,
                'sku' => 'FM-LB-004',
                'stock' => 14,
                'image' => '/assets/uploads/product-images/ladies-bag/classic-brown-monogram-handbag.webp',
                'featured' => true,
            ],
            [
                'id' => 'b3000000-0000-4000-8000-000000000003',
                'slug' => 'olive-drawstring-canvas-tote-bag',
                'name_en' => 'Olive Drawstring Canvas Tote Bag',
                'name_bn' => 'অলিভ ড্রস্ট্রিং ক্যানভাস টোট ব্যাগ',
                'short_en' => 'Casual olive canvas tote with a drawstring front pocket.',
                'short_bn' => 'ড্রস্ট্রিং ফ্রন্ট পকেটসহ ক্যাজুয়াল অলিভ ক্যানভাস টোট ব্যাগ।',
                'description_en' => 'A practical lightweight tote with long shoulder straps, a zipped main opening and a decorative drawstring front pocket.',
                'description_bn' => 'লং শোল্ডার স্ট্র্যাপ, জিপযুক্ত মেইন ওপেনিং ও ডেকোরেটিভ ড্রস্ট্রিং ফ্রন্ট পকেটসহ ব্যবহারিক হালকা টোট ব্যাগ।',
                'base_price' => 990,
                'sale_price' => 850,
                'purchase_price' => 578,
                'sku' => 'FM-LB-005',
                'stock' => 24,
                'image' => '/assets/uploads/product-images/ladies-bag/olive-drawstring-canvas-tote-bag.webp',
                'featured' => false,
            ],
            [
                'id' => 'b3000000-0000-4000-8000-000000000004',
                'slug' => 'premium-six-piece-handbag-set',
                'name_en' => 'Premium Six-Piece Handbag Set',
                'name_bn' => 'প্রিমিয়াম সিক্স-পিস হ্যান্ডব্যাগ সেট',
                'short_en' => 'A coordinated six-piece handbag and purse collection.',
                'short_bn' => 'ম্যাচিং হ্যান্ডব্যাগ ও পার্সের ছয়-পিস কালেকশন।',
                'description_en' => 'A complete matching set with multiple handbag sizes and compact purses, suitable for work, shopping and special occasions.',
                'description_bn' => 'বিভিন্ন সাইজের হ্যান্ডব্যাগ ও কমপ্যাক্ট পার্সসহ সম্পূর্ণ ম্যাচিং সেট, যা অফিস, শপিং ও বিশেষ অনুষ্ঠানের জন্য উপযোগী।',
                'base_price' => 2790,
                'sale_price' => 2390,
                'purchase_price' => 1625,
                'sku' => 'FM-LB-006',
                'stock' => 10,
                'image' => '/assets/uploads/product-images/ladies-bag/premium-six-piece-handbag-set.webp',
                'featured' => true,
            ],
            [
                'id' => 'b3000000-0000-4000-8000-000000000005',
                'slug' => 'classic-crescent-shoulder-bag-multicolor',
                'name_en' => 'Classic Crescent Shoulder Bag - Multiple Colors',
                'name_bn' => 'ক্লাসিক ক্রিসেন্ট শোল্ডার ব্যাগ - মাল্টিপল কালার',
                'short_en' => 'Curved everyday shoulder bag available in multiple elegant colors.',
                'short_bn' => 'একাধিক এলিগ্যান্ট কালারে পাওয়া যায় এমন কার্ভড এভরিডে শোল্ডার ব্যাগ।',
                'description_en' => 'A compact crescent-shaped shoulder bag with contrast trim, secure zip closure and a comfortable long handle in assorted colors.',
                'description_bn' => 'কনট্রাস্ট ট্রিম, সিকিউর জিপ ক্লোজার ও আরামদায়ক লং হ্যান্ডেলসহ বিভিন্ন রঙের কমপ্যাক্ট ক্রিসেন্ট শোল্ডার ব্যাগ।',
                'base_price' => 1950,
                'sale_price' => 1690,
                'purchase_price' => 1149,
                'sku' => 'FM-LB-007',
                'stock' => 18,
                'image' => '/assets/uploads/product-images/ladies-bag/classic-crescent-shoulder-bag-multicolor.webp',
                'featured' => false,
            ],
        ];

        DB::transaction(function () use ($categoryId, $now, $products): void {
            foreach ($products as $index => $product) {
                $existing = DB::table('products')->where('slug', $product['slug'])->first();

                DB::table('products')->updateOrInsert(
                    ['slug' => $product['slug']],
                    [
                        'id' => $existing?->id ?? $product['id'],
                        'name' => $product['name_bn'],
                        'name_en' => $product['name_en'],
                        'name_bn' => $product['name_bn'],
                        'short_description' => $product['short_bn'],
                        'short_description_en' => $product['short_en'],
                        'short_description_bn' => $product['short_bn'],
                        'description' => $product['description_bn'],
                        'description_en' => $product['description_en'],
                        'description_bn' => $product['description_bn'],
                        'base_price' => $product['base_price'],
                        'sale_price' => $product['sale_price'],
                        'purchase_price' => $product['purchase_price'],
                        'sku' => $product['sku'],
                        'stock_quantity' => $product['stock'],
                        'category_id' => $categoryId,
                        'brand_id' => null,
                        'image_url' => $product['image'],
                        'images' => json_encode([], JSON_UNESCAPED_SLASHES),
                        'is_active' => true,
                        'is_featured' => $product['featured'],
                        'weight' => '১',
                        'weight_en' => '1',
                        'weight_bn' => '১',
                        'unit' => 'পিস',
                        'unit_en' => 'piece',
                        'unit_bn' => 'পিস',
                        'created_at' => $existing?->created_at ?? $now->copy()->addSeconds($index),
                        'updated_at' => $now,
                    ]
                );
            }
        });
    }

    public function down(): void
    {
        DB::table('products')->whereIn('id', [
            'b3000000-0000-4000-8000-000000000001',
            'b3000000-0000-4000-8000-000000000002',
            'b3000000-0000-4000-8000-000000000003',
            'b3000000-0000-4000-8000-000000000004',
            'b3000000-0000-4000-8000-000000000005',
        ])->delete();
    }
};
