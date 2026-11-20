<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $now = now();
            $categoryIds = DB::table('categories')
                ->whereIn('slug', ['perfume', 'water-bottle'])
                ->pluck('id', 'slug');

            $products = [
                [
                    'id' => 'c3000000-0000-4000-8000-000000000001',
                    'category' => 'perfume',
                    'slug' => 'midnight-azure-eau-de-parfum-100ml',
                    'name_en' => 'Midnight Azure Eau De Parfum 100ml',
                    'name_bn' => 'মিডনাইট অ্যাজুর ইও ডি পারফিউম ১০০ মি.লি.',
                    'short_en' => 'A sophisticated fresh fragrance with citrus, marine and deep woody notes.',
                    'short_bn' => 'সিট্রাস, মেরিন ও গভীর উডি নোটের পরিশীলিত সতেজ সুগন্ধি।',
                    'description_en' => 'A refined long-lasting perfume that opens with crisp citrus and marine accords before settling into a smooth woody base.',
                    'description_bn' => 'ক্রিস্প সিট্রাস ও মেরিন সুবাস দিয়ে শুরু হয়ে মসৃণ উডি বেসে মিশে যাওয়া পরিশীলিত ও দীর্ঘস্থায়ী পারফিউম।',
                    'base_price' => 1850,
                    'sale_price' => 1550,
                    'purchase_price' => 1054,
                    'sku' => 'FM-PF-003',
                    'stock' => 16,
                    'image' => '/assets/uploads/product-images/catalog-20260719/midnight-azure-eau-de-parfum-100ml.png',
                    'weight_en' => '100',
                    'weight_bn' => '১০০',
                    'unit_en' => 'ml',
                    'unit_bn' => 'মি.লি.',
                ],
                [
                    'id' => 'c3000000-0000-4000-8000-000000000002',
                    'category' => 'perfume',
                    'slug' => 'rose-velvet-eau-de-parfum-75ml',
                    'name_en' => 'Rose Velvet Eau De Parfum 75ml',
                    'name_bn' => 'রোজ ভেলভেট ইও ডি পারফিউম ৭৫ মি.লি.',
                    'short_en' => 'A soft floral perfume blending rose petals, peony and warm white musk.',
                    'short_bn' => 'রোজ পেটাল, পিওনি ও উষ্ণ হোয়াইট মাস্কের কোমল ফ্লোরাল সুগন্ধি।',
                    'description_en' => 'An elegant everyday fragrance with luminous rose and peony notes layered over a clean, velvety white musk base.',
                    'description_bn' => 'উজ্জ্বল রোজ ও পিওনি নোটের সঙ্গে পরিষ্কার ভেলভেটি হোয়াইট মাস্ক বেসের এলিগ্যান্ট দৈনন্দিন সুগন্ধি।',
                    'base_price' => 1450,
                    'sale_price' => 1190,
                    'purchase_price' => 809,
                    'sku' => 'FM-PF-004',
                    'stock' => 20,
                    'image' => '/assets/uploads/product-images/catalog-20260719/rose-velvet-eau-de-parfum-75ml.png',
                    'weight_en' => '75',
                    'weight_bn' => '৭৫',
                    'unit_en' => 'ml',
                    'unit_bn' => 'মি.লি.',
                ],
                [
                    'id' => 'c3000000-0000-4000-8000-000000000003',
                    'category' => 'water-bottle',
                    'slug' => 'urban-black-insulated-bottle-750ml',
                    'name_en' => 'Urban Black Insulated Bottle 750ml',
                    'name_bn' => 'আরবান ব্ল্যাক ইনসুলেটেড বোতল ৭৫০ মি.লি.',
                    'short_en' => 'A durable matte-black insulated bottle with a convenient carry loop.',
                    'short_bn' => 'সুবিধাজনক ক্যারি লুপসহ টেকসই ম্যাট-ব্ল্যাক ইনসুলেটেড বোতল।',
                    'description_en' => 'A double-wall stainless-steel bottle designed to keep drinks at temperature, with a leak-resistant screw cap and carry loop.',
                    'description_bn' => 'পানীয়ের তাপমাত্রা ধরে রাখার জন্য ডাবল-ওয়াল স্টেইনলেস-স্টিল বোতল, সঙ্গে লিক-রেজিস্ট্যান্ট স্ক্রু ক্যাপ ও ক্যারি লুপ।',
                    'base_price' => 950,
                    'sale_price' => 790,
                    'purchase_price' => 537,
                    'sku' => 'FM-WB-002',
                    'stock' => 28,
                    'image' => '/assets/uploads/product-images/catalog-20260719/urban-black-insulated-bottle-750ml.png',
                    'weight_en' => '750',
                    'weight_bn' => '৭৫০',
                    'unit_en' => 'ml',
                    'unit_bn' => 'মি.লি.',
                ],
                [
                    'id' => 'c3000000-0000-4000-8000-000000000004',
                    'category' => 'water-bottle',
                    'slug' => 'active-lavender-sports-bottle-1l',
                    'name_en' => 'Active Lavender Sports Bottle 1L',
                    'name_bn' => 'অ্যাক্টিভ ল্যাভেন্ডার স্পোর্টস বোতল ১ লিটার',
                    'short_en' => 'A lightweight sports bottle with a lockable flip lid and carry handle.',
                    'short_bn' => 'লকযোগ্য ফ্লিপ লিড ও ক্যারি হ্যান্ডেলসহ হালকা স্পোর্টস বোতল।',
                    'description_en' => 'A roomy everyday hydration bottle featuring an easy one-touch flip lid, safety lock, comfortable grip and integrated handle.',
                    'description_bn' => 'ওয়ান-টাচ ফ্লিপ লিড, সেফটি লক, আরামদায়ক গ্রিপ ও বিল্ট-ইন হ্যান্ডেলসহ প্রশস্ত দৈনন্দিন পানির বোতল।',
                    'base_price' => 750,
                    'sale_price' => 620,
                    'purchase_price' => 422,
                    'sku' => 'FM-WB-003',
                    'stock' => 32,
                    'image' => '/assets/uploads/product-images/catalog-20260719/active-lavender-sports-bottle-1l.png',
                    'weight_en' => '1',
                    'weight_bn' => '১',
                    'unit_en' => 'liter',
                    'unit_bn' => 'লিটার',
                ],
                [
                    'id' => 'c3000000-0000-4000-8000-000000000005',
                    'category' => 'water-bottle',
                    'slug' => 'eco-teal-vacuum-flask-500ml',
                    'name_en' => 'Eco Teal Vacuum Flask 500ml',
                    'name_bn' => 'ইকো টিল ভ্যাকুয়াম ফ্লাস্ক ৫০০ মি.লি.',
                    'short_en' => 'A compact teal vacuum flask with a bamboo-finish cap and metal loop.',
                    'short_bn' => 'ব্যাম্বু-ফিনিশ ক্যাপ ও মেটাল লুপসহ কমপ্যাক্ট টিল ভ্যাকুয়াম ফ্লাস্ক।',
                    'description_en' => 'A stylish compact vacuum flask with an insulated steel body, leak-resistant bamboo-finish cap and easy-carry metal loop.',
                    'description_bn' => 'ইনসুলেটেড স্টিল বডি, লিক-রেজিস্ট্যান্ট ব্যাম্বু-ফিনিশ ক্যাপ ও সহজে বহনযোগ্য মেটাল লুপসহ স্টাইলিশ কমপ্যাক্ট ফ্লাস্ক।',
                    'base_price' => 850,
                    'sale_price' => 690,
                    'purchase_price' => 469,
                    'sku' => 'FM-WB-004',
                    'stock' => 24,
                    'image' => '/assets/uploads/product-images/catalog-20260719/eco-teal-vacuum-flask-500ml.png',
                    'weight_en' => '500',
                    'weight_bn' => '৫০০',
                    'unit_en' => 'ml',
                    'unit_bn' => 'মি.লি.',
                ],
            ];

            foreach ($products as $index => $product) {
                if (! isset($categoryIds[$product['category']])) {
                    continue;
                }

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
                        'category_id' => $categoryIds[$product['category']],
                        'brand_id' => null,
                        'image_url' => $product['image'],
                        'images' => json_encode([], JSON_UNESCAPED_SLASHES),
                        'is_active' => true,
                        'is_featured' => false,
                        'weight' => $product['weight_bn'],
                        'weight_en' => $product['weight_en'],
                        'weight_bn' => $product['weight_bn'],
                        'unit' => $product['unit_bn'],
                        'unit_en' => $product['unit_en'],
                        'unit_bn' => $product['unit_bn'],
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
            'c3000000-0000-4000-8000-000000000001',
            'c3000000-0000-4000-8000-000000000002',
            'c3000000-0000-4000-8000-000000000003',
            'c3000000-0000-4000-8000-000000000004',
            'c3000000-0000-4000-8000-000000000005',
        ])->delete();
    }
};
