<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // First, find or create T-Shirt category
        $tshirtCategory = DB::table('categories')
            ->where('slug', 'like', '%tshirt%')
            ->orWhere('slug', 'like', '%t-shirt%')
            ->first();

        if (!$tshirtCategory) {
            // Find Men's clothing category as parent
            $mensCategory = DB::table('categories')
                ->where('slug', 'like', '%clothing-men%')
                ->orWhere('name_en', 'like', '%Men%')
                ->first();

            $tshirtCategoryId = (string) Str::uuid();
            DB::table('categories')->insert([
                'id' => $tshirtCategoryId,
                'name' => 'T-Shirt',
                'name_en' => 'T-Shirt',
                'name_bn' => 'টি-শার্ট',
                'slug' => 'clothing-men-tshirt',
                'parent_id' => $mensCategory->id ?? null,
                'is_active' => true,
                'show_on_home' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $tshirtCategoryId = $tshirtCategory->id;
        }

        // T-shirt products data
        $products = [
            [
                'name_en' => 'Classic Gray Melange T-Shirt',
                'name_bn' => 'ক্লাসিক গ্রে মেলাঞ্জ টি-শার্ট',
                'description_en' => 'Comfortable gray melange t-shirt perfect for casual wear. Made from premium cotton blend fabric.',
                'description_bn' => 'নৈমিত্তিক পরিধানের জন্য আরামদায়ক গ্রে মেলাঞ্জ টি-শার্ট। প্রিমিয়াম কটন মিশ্রিত কাপড় থেকে তৈরি।',
                'base_price' => 650,
                'sale_price' => 450,
                'image_url' => '/assets/uploads/product-images/tshirt-gray-melange.jpg',
            ],
            [
                'name_en' => 'Instagram ID Print T-Shirt - Mint Green',
                'name_bn' => 'ইনস্টাগ্রাম আইডি প্রিন্ট টি-শার্ট - মিন্ট গ্রিন',
                'description_en' => 'Trendy mint green t-shirt with Instagram ID print and QR code. Perfect for social media enthusiasts.',
                'description_bn' => 'ইনস্টাগ্রাম আইডি প্রিন্ট এবং QR কোড সহ ট্রেন্ডি মিন্ট গ্রিন টি-শার্ট। সোশ্যাল মিডিয়া প্রেমীদের জন্য নিখুঁত।',
                'base_price' => 750,
                'sale_price' => 550,
                'image_url' => '/assets/uploads/product-images/tshirt-mint-instagram.jpg',
            ],
            [
                'name_en' => 'Basic Black T-Shirt',
                'name_bn' => 'বেসিক কালো টি-শার্ট',
                'description_en' => 'Essential black t-shirt for your wardrobe. Comfortable fit with premium quality fabric.',
                'description_bn' => 'আপনার পোশাক সংগ্রহের জন্য প্রয়োজনীয় কালো টি-শার্ট। প্রিমিয়াম মানের কাপড় দিয়ে আরামদায়ক ফিট।',
                'base_price' => 600,
                'sale_price' => 400,
                'image_url' => '/assets/uploads/product-images/tshirt-black-basic.jpg',
            ],
            [
                'name_en' => 'Navy Blue Round Neck T-Shirt',
                'name_bn' => 'নেভি ব্লু রাউন্ড নেক টি-শার্ট',
                'description_en' => 'Classic navy blue t-shirt with round neck. Perfect for everyday wear.',
                'description_bn' => 'রাউন্ড নেক সহ ক্লাসিক নেভি ব্লু টি-শার্ট। প্রতিদিনের পরিধানের জন্য নিখুঁত।',
                'base_price' => 650,
                'sale_price' => 450,
                'image_url' => '/assets/uploads/product-images/tshirt-navy-blue.jpg',
            ],
            [
                'name_en' => 'Olive Green Crew Neck T-Shirt',
                'name_bn' => 'অলিভ গ্রিন ক্রু নেক টি-শার্ট',
                'description_en' => 'Stylish olive green t-shirt with crew neck design. Comfortable and durable.',
                'description_bn' => 'ক্রু নেক ডিজাইন সহ স্টাইলিশ অলিভ গ্রিন টি-শার্ট। আরামদায়ক এবং টেকসই।',
                'base_price' => 700,
                'sale_price' => 480,
                'image_url' => '/assets/uploads/product-images/tshirt-olive-green.jpg',
            ],
            [
                'name_en' => 'Follow The Sunnah Long Sleeve T-Shirt',
                'name_bn' => 'ফলো দ্য সুন্নাহ লং স্লিভ টি-শার্ট',
                'description_en' => 'Islamic themed long sleeve t-shirt with "Follow The Sunnah" print. Premium quality cotton.',
                'description_bn' => '"ফলো দ্য সুন্নাহ" প্রিন্ট সহ ইসলামিক থিমের লং স্লিভ টি-শার্ট। প্রিমিয়াম মানের কটন।',
                'base_price' => 850,
                'sale_price' => 650,
                'image_url' => '/assets/uploads/product-images/tshirt-sunnah-long.jpg',
            ],
            [
                'name_en' => 'Gray Melange Half Sleeve T-Shirt',
                'name_bn' => 'গ্রে মেলাঞ্জ হাফ স্লিভ টি-শার্ট',
                'description_en' => 'Versatile gray melange half sleeve t-shirt. Perfect for all seasons.',
                'description_bn' => 'বহুমুখী গ্রে মেলাঞ্জ হাফ স্লিভ টি-শার্ট। সকল মৌসুমের জন্য উপযুক্ত।',
                'base_price' => 650,
                'sale_price' => 450,
                'image_url' => '/assets/uploads/product-images/tshirt-gray-half.jpg',
            ],
        ];

        foreach ($products as $index => $product) {
            $productId = (string) Str::uuid();
            $slug = Str::slug($product['name_en']) . '-' . time() . '-' . $index;

            DB::table('products')->insert([
                'id' => $productId,
                'name' => $product['name_bn'],
                'name_en' => $product['name_en'],
                'name_bn' => $product['name_bn'],
                'slug' => $slug,
                'category_id' => $tshirtCategoryId,
                'description' => $product['description_bn'],
                'description_en' => $product['description_en'],
                'description_bn' => $product['description_bn'],
                'base_price' => $product['base_price'],
                'sale_price' => $product['sale_price'],
                'stock_quantity' => rand(15, 50),
                'image_url' => $product['image_url'],
                'is_active' => true,
                'is_featured' => $index < 3, // First 3 as featured
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('products')
            ->where('name_en', 'like', '%T-Shirt%')
            ->whereRaw("created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)")
            ->delete();
    }
};
