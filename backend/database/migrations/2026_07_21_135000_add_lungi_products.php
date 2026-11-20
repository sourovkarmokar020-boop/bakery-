<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Find the Lungi category ID
        $lungiCategory = DB::table('categories')->where('slug', 'clothing-men-lungi')->first();
        
        if (!$lungiCategory) {
            return;
        }

        // Using existing category image for all lungis
        $lungiImage = '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp';
        
        $lungiProducts = [
            [
                'name' => 'Premium Cotton Lungi Blue Stripes',
                'name_bn' => 'প্রিমিয়াম কটন লুঙ্গি নীল ডোরা',
                'slug' => 'premium-cotton-lungi-blue-stripes',
                'description' => 'High quality cotton lungi with beautiful blue and black striped pattern. Comfortable and breathable fabric perfect for daily wear.',
                'description_bn' => 'সুন্দর নীল এবং কালো ডোরাকাটা প্যাটার্ন সহ উচ্চ মানের কটন লুঙ্গি। দৈনন্দিন পরিধানের জন্য আরামদায়ক এবং শ্বাসপ্রশ্বাসযোগ্য ফ্যাব্রিক।',
                'price' => 450.00,
                'image' => $lungiImage,
                'stock' => 50,
            ],
            [
                'name' => 'Traditional Lungi Brown Blue Check',
                'name_bn' => 'ট্র্যাডিশনাল লুঙ্গি বাদামী নীল চেক',
                'slug' => 'traditional-lungi-brown-blue-check',
                'description' => 'Classic checked lungi with brown and blue pattern. Made from premium quality cotton for maximum comfort.',
                'description_bn' => 'বাদামী এবং নীল প্যাটার্ন সহ ক্লাসিক চেক লুঙ্গি। সর্বাধিক আরামের জন্য প্রিমিয়াম মানের কটন থেকে তৈরি।',
                'price' => 480.00,
                'image' => $lungiImage,
                'stock' => 40,
            ],
            [
                'name' => 'Soft Cotton Lungi Light Brown Blue',
                'name_bn' => 'নরম কটন লুঙ্গি হালকা বাদামী নীল',
                'slug' => 'soft-cotton-lungi-light-brown-blue',
                'description' => 'Elegant light brown and blue checked lungi. Soft fabric ensures all-day comfort.',
                'description_bn' => 'মার্জিত হালকা বাদামী এবং নীল চেক লুঙ্গি। নরম ফ্যাব্রিক সারাদিন আরাম নিশ্চিত করে।',
                'price' => 420.00,
                'image' => $lungiImage,
                'stock' => 45,
            ],
            [
                'name' => 'Green White Check Lungi',
                'name_bn' => 'সবুজ সাদা চেক লুঙ্গি',
                'slug' => 'green-white-check-lungi',
                'description' => 'Fresh green and white checked pattern lungi. Perfect for casual and formal occasions.',
                'description_bn' => 'তাজা সবুজ এবং সাদা চেক প্যাটার্ন লুঙ্গি। নৈমিত্তিক এবং আনুষ্ঠানিক অনুষ্ঠানের জন্য নিখুঁত।',
                'price' => 490.00,
                'image' => $lungiImage,
                'stock' => 35,
            ],
            [
                'name' => 'Multicolor Cotton Lungi',
                'name_bn' => 'বহুরঙা কটন লুঙ্গি',
                'slug' => 'multicolor-cotton-lungi',
                'description' => 'Vibrant multicolor lungi with blue, brown and white pattern. Stylish and comfortable.',
                'description_bn' => 'নীল, বাদামী এবং সাদা প্যাটার্ন সহ প্রাণবন্ত বহুরঙা লুঙ্গি। স্টাইলিশ এবং আরামদায়ক।',
                'price' => 520.00,
                'image' => $lungiImage,
                'stock' => 30,
            ],
            [
                'name' => 'Colorful Check Lungi Turquoise Pink',
                'name_bn' => 'রঙিন চেক লুঙ্গি ফিরোজা গোলাপী',
                'slug' => 'colorful-check-lungi-turquoise-pink',
                'description' => 'Unique turquoise, pink and blue checked lungi. Stand out with this distinctive design.',
                'description_bn' => 'অনন্য ফিরোজা, গোলাপী এবং নীল চেক লুঙ্গি। এই স্বতন্ত্র ডিজাইনের সাথে আলাদা হয়ে উঠুন।',
                'price' => 550.00,
                'image' => $lungiImage,
                'stock' => 25,
            ],
            [
                'name' => 'Purple Blue Plaid Lungi',
                'name_bn' => 'বেগুনি নীল প্লেইড লুঙ্গি',
                'slug' => 'purple-blue-plaid-lungi',
                'description' => 'Elegant purple and blue plaid pattern lungi. Premium quality cotton fabric.',
                'description_bn' => 'মার্জিত বেগুনি এবং নীল প্লেইড প্যাটার্ন লুঙ্গি। প্রিমিয়াম মানের কটন ফ্যাব্রিক।',
                'price' => 510.00,
                'image' => $lungiImage,
                'stock' => 40,
            ],
            [
                'name' => 'Blue White Check Cotton Lungi',
                'name_bn' => 'নীল সাদা চেক কটন লুঙ্গি',
                'slug' => 'blue-white-check-cotton-lungi',
                'description' => 'Classic blue and white checked lungi with border design. Comfortable everyday wear.',
                'description_bn' => 'বর্ডার ডিজাইন সহ ক্লাসিক নীল এবং সাদা চেক লুঙ্গি। আরামদায়ক দৈনন্দিন পরিধান।',
                'price' => 470.00,
                'image' => $lungiImage,
                'stock' => 50,
            ],
            [
                'name' => 'Mixed Blue Check Lungi Premium',
                'name_bn' => 'মিক্সড ব্লু চেক লুঙ্গি প্রিমিয়াম',
                'slug' => 'mixed-blue-check-lungi-premium',
                'description' => 'Premium quality lungi with mixed blue, black and white checks. Durable and stylish.',
                'description_bn' => 'মিশ্র নীল, কালো এবং সাদা চেক সহ প্রিমিয়াম মানের লুঙ্গি। টেকসই এবং স্টাইলিশ।',
                'price' => 580.00,
                'image' => $lungiImage,
                'stock' => 35,
            ],
            [
                'name' => 'Black White Gingham Lungi',
                'name_bn' => 'কালো সাদা গিংহ্যাম লুঙ্গি',
                'slug' => 'black-white-gingham-lungi',
                'description' => 'Classic black and white gingham pattern lungi. Timeless design with excellent quality.',
                'description_bn' => 'ক্লাসিক কালো এবং সাদা গিংহ্যাম প্যাটার্ন লুঙ্গি। চমৎকার মানের সাথে কালজয়ী ডিজাইন।',
                'price' => 460.00,
                'image' => $lungiImage,
                'stock' => 45,
            ],
        ];

        foreach ($lungiProducts as $product) {
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
                'category_id' => $lungiCategory->id,
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
        // Remove lungi products
        $productSlugs = [
            'premium-cotton-lungi-blue-stripes',
            'traditional-lungi-brown-blue-check',
            'soft-cotton-lungi-light-brown-blue',
            'green-white-check-lungi',
            'multicolor-cotton-lungi',
            'colorful-check-lungi-turquoise-pink',
            'purple-blue-plaid-lungi',
            'blue-white-check-cotton-lungi',
            'mixed-blue-check-lungi-premium',
            'black-white-gingham-lungi',
        ];

        DB::table('products')->whereIn('slug', $productSlugs)->delete();
    }
};
