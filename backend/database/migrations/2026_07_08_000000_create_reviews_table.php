<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->uuid('id')->primary();
                // product_id null = হোমপেজের general testimonial; কোনো product-এর id থাকলে সেই product-এর review
                $table->uuid('product_id')->nullable()->index();
                $table->text('customer_name');
                $table->text('avatar_url')->nullable();
                $table->unsignedTinyInteger('rating')->default(5);
                $table->text('review_text');
                // কাস্টমার product page থেকে দিলে false থাকে — admin approve করলে সাইটে দেখায়
                $table->boolean('is_approved')->default(false);
                // হোমপেজের "গ্রাহকদের অভিজ্ঞতা" marquee-তে দেখাবে কিনা
                $table->boolean('is_featured')->default(false);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // আগের hardcoded হোমপেজ রিভিউগুলো seed — approved + featured করে রাখা হয়
        if (DB::table('reviews')->count() === 0) {
            $seed = [
                ['রহিমা আক্তার', 5, 'সুন্দরবনের খাঁটি মধু অর্ডার করেছিলাম, কোয়ালিটি আর প্যাকেজিং দুটোই দারুণ। ধন্যবাদ সৌখিন পণ্য!', 'https://i.pravatar.cc/150?img=47'],
                ['আব্দুল মালেক', 5, 'খাঁটি গাওয়া ঘি-এর ঘ্রাণ আর স্বাদ একদম অসাধারণ। এমন খাঁটি জিনিস আজকাল পাওয়াই মুশকিল।', 'https://i.pravatar.cc/150?img=12'],
                ['তানভীর হাসান', 5, 'আজওয়া খেজুর ২৪ ঘন্টার মধ্যে ডেলিভারি পেয়েছি। প্রোডাক্ট সম্পূর্ণ অথেন্টিক। সৌখিন পণ্য-কে ধন্যবাদ।', 'https://i.pravatar.cc/150?img=15'],
                ['ফাতেমা বেগম', 5, 'অনেক দিন ধরে খাঁটি সরিষার তেল খুঁজছিলাম, অবশেষে সৌখিন পণ্য-তে পেলাম! ঝাঁঝ আর স্বাদ একদম গ্রামের মতো।', 'https://i.pravatar.cc/150?img=49'],
                ['করিম উদ্দিন', 5, 'কালোজিরা তেল অসাধারণ কোয়ালিটি। নিয়মিত ব্যবহার করছি, আবার অর্ডার করবো ইনশাআল্লাহ।', 'https://i.pravatar.cc/150?img=57'],
                ['সাবিনা ইয়াসমিন', 4, 'চিনিগুঁড়া চাল আর কাজু বাদাম দুটোই ফ্রেশ পেয়েছি। বাচ্চারা খুব পছন্দ করেছে। ধন্যবাদ সৌখিন পণ্য!', 'https://i.pravatar.cc/150?img=44'],
                ['মোঃ রাসেল মিয়া', 5, 'নলেন গুড় আর খেজুরের গুড় সত্যিই খাঁটি, ভেজালের কোনো ব্যাপার নেই। পরিবারের সবাই পছন্দ করেছে।', 'https://i.pravatar.cc/150?img=59'],
                ['নাসরিন সুলতানা', 5, 'হলুদ গুঁড়া আর জিরা গুঁড়া রান্নায় দারুণ স্বাদ আনে, কোনো ভেজাল নেই। বারবার কিনব সৌখিন পণ্য থেকে।', 'https://i.pravatar.cc/150?img=45'],
            ];
            foreach ($seed as $i => [$name, $rating, $text, $avatar]) {
                DB::table('reviews')->insert([
                    'id' => (string) Str::uuid(),
                    'product_id' => null,
                    'customer_name' => $name,
                    'avatar_url' => $avatar,
                    'rating' => $rating,
                    'review_text' => $text,
                    'is_approved' => true,
                    'is_featured' => true,
                    'sort_order' => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
