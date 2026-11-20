<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Find the Shirt category ID
        $shirtCategory = DB::table('categories')->where('slug', 'clothing-men-shirt')->first();
        
        if (!$shirtCategory) {
            return;
        }

        // Using existing category image for all shirts
        $shirtImage = '/assets/uploads/category-images/clothing/man/ai-men-shirt-1-BYdORFJy.jpg';
        
        $shirtProducts = [
            [
                'name' => 'Vibrant Blue Check Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট ব্লু চেক স্লিম ফিট শার্ট',
                'slug' => 'vibrant-blue-check-slim-fit-shirt',
                'description' => 'Premium quality blue check pattern shirt with slim fit design. Made in Bangladesh by Vibrant. Perfect for office and formal occasions.',
                'description_bn' => 'স্লিম ফিট ডিজাইন সহ প্রিমিয়াম মানের নীল চেক প্যাটার্ন শার্ট। ভাইব্রান্ট দ্বারা বাংলাদেশে তৈরি। অফিস এবং আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',
                'price' => 1250.00,
                'image' => $shirtImage,
                'stock' => 45,
            ],
            [
                'name' => 'Vibrant Navy Print Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট নেভি প্রিন্ট স্লিম ফিট শার্ট',
                'slug' => 'vibrant-navy-print-slim-fit-shirt',
                'description' => 'Elegant navy blue shirt with subtle print pattern. Slim fit design for modern style. Made in Bangladesh.',
                'description_bn' => 'সূক্ষ্ম প্রিন্ট প্যাটার্ন সহ মার্জিত নেভি ব্লু শার্ট। আধুনিক স্টাইলের জন্য স্লিম ফিট ডিজাইন। বাংলাদেশে তৈরি।',
                'price' => 1280.00,
                'image' => $shirtImage,
                'stock' => 40,
            ],
            [
                'name' => 'Vibrant Turquoise Striped Contrast Shirt',
                'name_bn' => 'ভাইব্রান্ট টার্কোয়েজ স্ট্রাইপড কনট্রাস্ট শার্ট',
                'slug' => 'vibrant-turquoise-striped-contrast-shirt',
                'description' => 'Eye-catching turquoise striped shirt with white contrast collar and cuffs. Slim fit design perfect for parties and special occasions.',
                'description_bn' => 'সাদা কনট্রাস্ট কলার এবং কাফ সহ আকর্ষণীয় টার্কোয়েজ ডোরাকাটা শার্ট। পার্টি এবং বিশেষ অনুষ্ঠানের জন্য নিখুঁত স্লিম ফিট ডিজাইন।',
                'price' => 1350.00,
                'image' => $shirtImage,
                'stock' => 35,
            ],
            [
                'name' => 'Vibrant Beige Striped Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট বেইজ স্ট্রাইপড স্লিম ফিট শার্ট',
                'slug' => 'vibrant-beige-striped-slim-fit-shirt',
                'description' => 'Classic beige striped shirt with button-down collar. Comfortable and professional look for office wear.',
                'description_bn' => 'বাটন-ডাউন কলার সহ ক্লাসিক বেইজ ডোরাকাটা শার্ট। অফিস পরিধানের জন্য আরামদায়ক এবং পেশাদার চেহারা।',
                'price' => 1220.00,
                'image' => $shirtImage,
                'stock' => 50,
            ],
            [
                'name' => 'Vibrant Yellow Striped Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট ইয়েলো স্ট্রাইপড স্লিম ফিট শার্ট',
                'slug' => 'vibrant-yellow-striped-slim-fit-shirt',
                'description' => 'Bright yellow and white striped shirt with button-down collar. Adds a pop of color to your wardrobe.',
                'description_bn' => 'বাটন-ডাউন কলার সহ উজ্জ্বল হলুদ এবং সাদা ডোরাকাটা শার্ট। আপনার পোশাকে রঙের ছোঁয়া যোগ করে।',
                'price' => 1240.00,
                'image' => $shirtImage,
                'stock' => 42,
            ],
            [
                'name' => 'Vibrant Light Blue Striped Shirt',
                'name_bn' => 'ভাইব্রান্ট লাইট ব্লু স্ট্রাইপড শার্ট',
                'slug' => 'vibrant-light-blue-striped-shirt',
                'description' => 'Refreshing light blue and white striped formal shirt. Perfect for business meetings and professional settings.',
                'description_bn' => 'সতেজ হালকা নীল এবং সাদা ডোরাকাটা ফরমাল শার্ট। ব্যবসায়িক মিটিং এবং পেশাদার সেটিংসের জন্য নিখুঁত।',
                'price' => 1200.00,
                'image' => $shirtImage,
                'stock' => 48,
            ],
            [
                'name' => 'Vibrant Teal Dotted Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট টিল ডটেড স্লিম ফিট শার্ট',
                'slug' => 'vibrant-teal-dotted-slim-fit-shirt',
                'description' => 'Stylish teal shirt with subtle dot pattern. Slim fit design for a modern and sophisticated look.',
                'description_bn' => 'সূক্ষ্ম ডট প্যাটার্ন সহ স্টাইলিশ টিল শার্ট। আধুনিক এবং পরিশীলিত চেহারার জন্য স্লিম ফিট ডিজাইন।',
                'price' => 1290.00,
                'image' => $shirtImage,
                'stock' => 38,
            ],
            [
                'name' => 'Vibrant Navy Blue Solid Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট নেভি ব্লু সলিড স্লিম ফিট শার্ট',
                'slug' => 'vibrant-navy-blue-solid-slim-fit-shirt',
                'description' => 'Classic navy blue solid color shirt. Versatile and professional, perfect for any formal occasion.',
                'description_bn' => 'ক্লাসিক নেভি ব্লু সলিড কালার শার্ট। বহুমুখী এবং পেশাদার, যেকোনো আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',
                'price' => 1180.00,
                'image' => $shirtImage,
                'stock' => 55,
            ],
            [
                'name' => 'Vibrant Floral Print Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট ফ্লোরাল প্রিন্ট স্লিম ফিট শার্ট',
                'slug' => 'vibrant-floral-print-slim-fit-shirt',
                'description' => 'Trendy floral print shirt in blue tones. Perfect for casual outings and weekend gatherings.',
                'description_bn' => 'নীল টোনে ট্রেন্ডি ফ্লোরাল প্রিন্ট শার্ট। নৈমিত্তিক বহির্গমন এবং সাপ্তাহান্তের সমাবেশের জন্য নিখুঁত।',
                'price' => 1320.00,
                'image' => $shirtImage,
                'stock' => 30,
            ],
            [
                'name' => 'Vibrant Turquoise Textured Slim Fit Shirt',
                'name_bn' => 'ভাইব্রান্ট টার্কোয়েজ টেক্সচার্ড স্লিম ফিট শার্ট',
                'slug' => 'vibrant-turquoise-textured-slim-fit-shirt',
                'description' => 'Premium turquoise textured shirt with modern design. Slim fit cut for a sharp and stylish appearance.',
                'description_bn' => 'আধুনিক ডিজাইন সহ প্রিমিয়াম টার্কোয়েজ টেক্সচার্ড শার্ট। তীক্ষ্ণ এবং স্টাইলিশ চেহারার জন্য স্লিম ফিট কাট।',
                'price' => 1380.00,
                'image' => $shirtImage,
                'stock' => 32,
            ],
        ];

        foreach ($shirtProducts as $product) {
            DB::table('products')->insert([
                'id' => DB::raw('(UUID())'),
                'name' => $product['name'],
                'name_en' => $product['name'],
                'name_bn' => $product['name_bn'],
                'slug' => $product['slug'],
                'description' => $product['description'],
                'description_en' => $product['description'],
                'description_bn' => $product['description_bn'],
                'base_price' => $product['price'],
                'stock_quantity' => $product['stock'],
                'category_id' => $shirtCategory->id,
                'image_url' => $product['image'],
                'is_featured' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Remove shirt products
        $productSlugs = [
            'vibrant-blue-check-slim-fit-shirt',
            'vibrant-navy-print-slim-fit-shirt',
            'vibrant-turquoise-striped-contrast-shirt',
            'vibrant-beige-striped-slim-fit-shirt',
            'vibrant-yellow-striped-slim-fit-shirt',
            'vibrant-light-blue-striped-shirt',
            'vibrant-teal-dotted-slim-fit-shirt',
            'vibrant-navy-blue-solid-slim-fit-shirt',
            'vibrant-floral-print-slim-fit-shirt',
            'vibrant-turquoise-textured-slim-fit-shirt',
        ];

        DB::table('products')->whereIn('slug', $productSlugs)->delete();
    }
};
