<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $categoryId = DB::table('categories')->where('slug', 'mans-bag')->value('id');

        if (! $categoryId) {
            return;
        }

        $now = now();
        $products = [
            [
                'id' => 'b4000000-0000-4000-8000-000000000001',
                'slug' => 'vintage-brown-laptop-briefcase',
                'name_en' => 'Vintage Brown Laptop Briefcase',
                'name_bn' => 'ভিনটেজ ব্রাউন ল্যাপটপ ব্রিফকেস',
                'short_en' => 'Spacious vintage-look briefcase with handles and an adjustable strap.',
                'short_bn' => 'হ্যান্ডেল ও অ্যাডজাস্টেবল স্ট্র্যাপসহ প্রশস্ত ভিনটেজ-লুক ব্রিফকেস।',
                'description_en' => 'A durable work bag with multiple zipped compartments, organized front pockets, sturdy carry handles and a detachable shoulder strap.',
                'description_bn' => 'একাধিক জিপ কম্পার্টমেন্ট, গোছানো ফ্রন্ট পকেট, মজবুত ক্যারি হ্যান্ডেল ও ডিট্যাচেবল শোল্ডার স্ট্র্যাপসহ টেকসই অফিস ব্যাগ।',
                'base_price' => 2450,
                'sale_price' => 2090,
                'purchase_price' => 1421,
                'sku' => 'FM-MB-003',
                'stock' => 15,
                'image' => '/assets/uploads/product-images/mans-bag/vintage-brown-laptop-briefcase.webp',
                'featured' => true,
            ],
            [
                'id' => 'b4000000-0000-4000-8000-000000000002',
                'slug' => 'executive-black-laptop-briefcase',
                'name_en' => 'Executive Black Laptop Briefcase',
                'name_bn' => 'এক্সিকিউটিভ ব্ল্যাক ল্যাপটপ ব্রিফকেস',
                'short_en' => 'Slim black office bag with padded space for a laptop and documents.',
                'short_bn' => 'ল্যাপটপ ও ডকুমেন্টের প্যাডেড স্পেসসহ স্লিম ব্ল্যাক অফিস ব্যাগ।',
                'description_en' => 'A smart professional briefcase featuring a wide zipped opening, structured handles and organized compartments for a laptop, notebook and daily essentials.',
                'description_bn' => 'ওয়াইড জিপ ওপেনিং, স্ট্রাকচার্ড হ্যান্ডেল এবং ল্যাপটপ, নোটবুক ও দৈনন্দিন প্রয়োজনীয় জিনিসের গোছানো কম্পার্টমেন্টসহ স্মার্ট প্রফেশনাল ব্রিফকেস।',
                'base_price' => 2150,
                'sale_price' => 1790,
                'purchase_price' => 1217,
                'sku' => 'FM-MB-004',
                'stock' => 18,
                'image' => '/assets/uploads/product-images/mans-bag/executive-black-laptop-briefcase.webp',
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
            'b4000000-0000-4000-8000-000000000001',
            'b4000000-0000-4000-8000-000000000002',
        ])->delete();
    }
};
