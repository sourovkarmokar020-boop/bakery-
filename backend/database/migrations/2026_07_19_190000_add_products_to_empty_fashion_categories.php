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
                ->whereIn('slug', ['perfume', 'mans-bag', 'ladies-bag'])
                ->pluck('id', 'slug');

            $products = [
                [
                    'id' => 'b2000000-0000-4000-8000-000000000001',
                    'category' => 'mans-bag',
                    'slug' => 'premium-black-crossbody-messenger-bag',
                    'name_en' => 'Premium Black Crossbody Messenger Bag',
                    'name_bn' => 'প্রিমিয়াম ব্ল্যাক ক্রসবডি মেসেঞ্জার ব্যাগ',
                    'short_en' => 'Smart faux-leather crossbody bag with an adjustable shoulder strap.',
                    'short_bn' => 'অ্যাডজাস্টেবল শোল্ডার স্ট্র্যাপসহ স্মার্ট ফক্স-লেদার ক্রসবডি ব্যাগ।',
                    'description_en' => 'A compact everyday messenger bag with a secure flap closure, organized inner space and a comfortable adjustable strap.',
                    'description_bn' => 'সিকিউর ফ্ল্যাপ ক্লোজার, গোছানো ইনার স্পেস ও আরামদায়ক অ্যাডজাস্টেবল স্ট্র্যাপসহ দৈনন্দিন ব্যবহারের কমপ্যাক্ট মেসেঞ্জার ব্যাগ।',
                    'base_price' => 1650,
                    'sale_price' => 1390,
                    'purchase_price' => 945,
                    'sku' => 'FM-MB-001',
                    'stock' => 18,
                    'image' => '/assets/uploads/product-images/fashion/premium-black-crossbody-messenger-bag.webp',
                    'featured' => true,
                ],
                [
                    'id' => 'b2000000-0000-4000-8000-000000000002',
                    'category' => 'mans-bag',
                    'slug' => 'classic-brown-leather-backpack',
                    'name_en' => 'Classic Brown Leather Backpack',
                    'name_bn' => 'ক্লাসিক ব্রাউন লেদার ব্যাকপ্যাক',
                    'short_en' => 'Spacious brown backpack with multiple pockets for work and travel.',
                    'short_bn' => 'কাজ ও ভ্রমণের জন্য একাধিক পকেটসহ প্রশস্ত ব্রাউন ব্যাকপ্যাক।',
                    'description_en' => 'A durable, roomy backpack with padded shoulder straps, multiple zip compartments and a timeless leather-look finish.',
                    'description_bn' => 'প্যাডেড শোল্ডার স্ট্র্যাপ, একাধিক জিপ কম্পার্টমেন্ট ও ক্লাসিক লেদার-লুক ফিনিশসহ টেকসই এবং প্রশস্ত ব্যাকপ্যাক।',
                    'base_price' => 2250,
                    'sale_price' => 1890,
                    'purchase_price' => 1285,
                    'sku' => 'FM-MB-002',
                    'stock' => 12,
                    'image' => '/assets/uploads/product-images/fashion/classic-brown-leather-backpack.webp',
                    'featured' => false,
                ],
                [
                    'id' => 'b2000000-0000-4000-8000-000000000003',
                    'category' => 'ladies-bag',
                    'slug' => 'elegant-beige-quilted-shoulder-bag',
                    'name_en' => 'Elegant Beige Quilted Shoulder Bag',
                    'name_bn' => 'এলিগ্যান্ট বেইজ কুইল্টেড শোল্ডার ব্যাগ',
                    'short_en' => 'Elegant quilted handbag with a polished gold-tone chain strap.',
                    'short_bn' => 'পলিশড গোল্ড-টোন চেইন স্ট্র্যাপসহ এলিগ্যান্ট কুইল্টেড হ্যান্ডব্যাগ।',
                    'description_en' => 'A refined compact shoulder bag featuring soft quilted texture, a secure clasp and a versatile chain strap.',
                    'description_bn' => 'সফট কুইল্টেড টেক্সচার, সিকিউর ক্ল্যাস্প ও বহুমুখী চেইন স্ট্র্যাপসহ পরিপাটি কমপ্যাক্ট শোল্ডার ব্যাগ।',
                    'base_price' => 1750,
                    'sale_price' => 1450,
                    'purchase_price' => 986,
                    'sku' => 'FM-LB-001',
                    'stock' => 16,
                    'image' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                    'featured' => true,
                ],
                [
                    'id' => 'b2000000-0000-4000-8000-000000000004',
                    'category' => 'ladies-bag',
                    'slug' => 'modern-maroon-tote-bag',
                    'name_en' => 'Modern Maroon Tote Bag',
                    'name_bn' => 'মডার্ন মেরুন টোট ব্যাগ',
                    'short_en' => 'Roomy maroon tote bag with a clean, versatile everyday design.',
                    'short_bn' => 'পরিষ্কার ও বহুমুখী ডিজাইনের প্রশস্ত মেরুন টোট ব্যাগ।',
                    'description_en' => 'A stylish everyday tote with sturdy double handles, neat stitching and enough room for daily essentials.',
                    'description_bn' => 'মজবুত ডাবল হ্যান্ডেল, পরিপাটি স্টিচিং ও দৈনন্দিন প্রয়োজনীয় জিনিস রাখার পর্যাপ্ত জায়গাসহ স্টাইলিশ টোট ব্যাগ।',
                    'base_price' => 1550,
                    'sale_price' => 1290,
                    'purchase_price' => 877,
                    'sku' => 'FM-LB-002',
                    'stock' => 20,
                    'image' => '/assets/uploads/product-images/fashion/modern-maroon-tote-bag.webp',
                    'featured' => false,
                ],
                [
                    'id' => 'b2000000-0000-4000-8000-000000000005',
                    'category' => 'perfume',
                    'slug' => 'royal-oud-eau-de-parfum-100ml',
                    'name_en' => 'Royal Oud Eau De Parfum 100ml',
                    'name_bn' => 'রয়্যাল উদ ইও ডি পারফিউম ১০০ মি.লি.',
                    'short_en' => 'A rich unisex oud fragrance with warm woody and amber notes.',
                    'short_bn' => 'উষ্ণ উডি ও অ্যাম্বার নোটের সমৃদ্ধ ইউনিসেক্স উদ সুগন্ধি।',
                    'description_en' => 'A long-lasting oriental fragrance blending deep oud, warm amber and smooth woody notes for an elegant finish.',
                    'description_bn' => 'গভীর উদ, উষ্ণ অ্যাম্বার ও মসৃণ উডি নোটের মিশ্রণে তৈরি দীর্ঘস্থায়ী ও এলিগ্যান্ট ওরিয়েন্টাল সুগন্ধি।',
                    'base_price' => 1950,
                    'sale_price' => 1650,
                    'purchase_price' => 1122,
                    'sku' => 'FM-PF-001',
                    'stock' => 14,
                    'image' => '/assets/uploads/product-images/fashion/royal-oud-eau-de-parfum-100ml.webp',
                    'featured' => true,
                ],
                [
                    'id' => 'b2000000-0000-4000-8000-000000000006',
                    'category' => 'perfume',
                    'slug' => 'blush-bloom-eau-de-parfum-80ml',
                    'name_en' => 'Blush Bloom Eau De Parfum 80ml',
                    'name_bn' => 'ব্লাশ ব্লুম ইও ডি পারফিউম ৮০ মি.লি.',
                    'short_en' => 'A fresh floral fragrance with soft rose, jasmine and musk notes.',
                    'short_bn' => 'সফট রোজ, জেসমিন ও মাস্ক নোটের ফ্রেশ ফ্লোরাল সুগন্ধি।',
                    'description_en' => 'A graceful everyday perfume opening with fresh florals and settling into a soft, clean musk base.',
                    'description_bn' => 'ফ্রেশ ফ্লোরাল নোট দিয়ে শুরু হয়ে সফট ও ক্লিন মাস্ক বেসে মিশে যাওয়া দৈনন্দিন ব্যবহারের স্নিগ্ধ পারফিউম।',
                    'base_price' => 1650,
                    'sale_price' => 1390,
                    'purchase_price' => 945,
                    'sku' => 'FM-PF-002',
                    'stock' => 18,
                    'image' => '/assets/uploads/product-images/fashion/blush-bloom-eau-de-parfum-80ml.webp',
                    'featured' => false,
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
            'b2000000-0000-4000-8000-000000000001',
            'b2000000-0000-4000-8000-000000000002',
            'b2000000-0000-4000-8000-000000000003',
            'b2000000-0000-4000-8000-000000000004',
            'b2000000-0000-4000-8000-000000000005',
            'b2000000-0000-4000-8000-000000000006',
        ])->delete();
    }
};
