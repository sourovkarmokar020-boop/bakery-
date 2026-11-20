<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seeds products into every category that currently has none.
 *
 * Images are intentionally left as the shared placeholder (`/placeholder.svg`)
 * so real photos can be uploaded later from the admin panel without touching
 * this migration.
 */
return new class extends Migration
{
    /**
     * category slug => [blurb_en, blurb_bn, items[ [name_en, name_bn, base_price, sale_price, stock] ]]
     */
    private function catalog(): array
    {
        return [
            /* ---------------- Clothing > Men ---------------- */
            'clothing-men-pants' => [
                'blurb_en' => 'Comfortable everyday men\'s pant with a clean cut and durable stitching. Available in all standard sizes.',
                'blurb_bn' => 'আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।',
                'items' => [
                    ['Classic Black Formal Pant', 'ক্লাসিক ব্ল্যাক ফরমাল প্যান্ট', 1450, 1290, 40],
                    ['Navy Blue Chino Pant', 'নেভি ব্লু চিনো প্যান্ট', 1350, 1190, 45],
                    ['Khaki Slim Fit Gabardine Pant', 'খাকি স্লিম ফিট গ্যাবার্ডিন প্যান্ট', 1250, 1120, 50],
                    ['Charcoal Grey Office Pant', 'চারকোল গ্রে অফিস প্যান্ট', 1490, 1340, 35],
                    ['Olive Green Cargo Pant', 'অলিভ গ্রিন কার্গো প্যান্ট', 1550, 1390, 30],
                ],
            ],
            'clothing-men-jackets' => [
                'blurb_en' => 'Warm, well-finished men\'s jacket built for the winter season and casual outings alike.',
                'blurb_bn' => 'উষ্ণ ও সুন্দর ফিনিশিংয়ের পুরুষদের জ্যাকেট, শীতের মৌসুম ও ক্যাজুয়াল ব্যবহারের জন্য উপযুক্ত।',
                'items' => [
                    ['Black Leather Biker Jacket', 'ব্ল্যাক লেদার বাইকার জ্যাকেট', 3900, 3450, 20],
                    ['Navy Denim Jacket', 'নেভি ডেনিম জ্যাকেট', 2450, 2190, 28],
                    ['Olive Bomber Jacket', 'অলিভ বোম্বার জ্যাকেট', 2650, 2350, 25],
                    ['Grey Hooded Winter Jacket', 'গ্রে হুডেড উইন্টার জ্যাকেট', 2950, 2650, 22],
                    ['Blue Windbreaker Jacket', 'ব্লু উইন্ডব্রেকার জ্যাকেট', 1950, 1750, 30],
                ],
            ],

            /* ---------------- Clothing > Women ---------------- */
            'clothing-women-salwar-kameez' => [
                'blurb_en' => 'Elegant salwar kameez set with soft, breathable fabric — comfortable for daily wear and occasions.',
                'blurb_bn' => 'নরম ও আরামদায়ক কাপড়ের মার্জিত সালোয়ার কামিজ সেট — প্রতিদিনের ব্যবহার ও অনুষ্ঠান দুটোতেই মানানসই।',
                'items' => [
                    ['Cotton Embroidered Salwar Kameez', 'কটন এমব্রয়ডারি সালোয়ার কামিজ', 2250, 1990, 30],
                    ['Printed Lawn Salwar Kameez', 'প্রিন্টেড লন সালোয়ার কামিজ', 1850, 1650, 40],
                    ['Georgette Party Salwar Kameez', 'জর্জেট পার্টি সালোয়ার কামিজ', 3200, 2850, 20],
                    ['Block Print Cotton Salwar Kameez', 'ব্লক প্রিন্ট কটন সালোয়ার কামিজ', 1750, 1550, 35],
                    ['Silk Karchupi Salwar Kameez', 'সিল্ক কারচুপি সালোয়ার কামিজ', 3600, 3200, 18],
                ],
            ],
            'clothing-women-burqa' => [
                'blurb_en' => 'Modest, lightweight burqa with a comfortable fit and quality finishing for everyday use.',
                'blurb_bn' => 'হালকা ও আরামদায়ক ফিটের মার্জিত বোরকা, প্রতিদিনের ব্যবহারের জন্য মানসম্মত ফিনিশিং।',
                'items' => [
                    ['Black Butterfly Burqa', 'ব্ল্যাক বাটারফ্লাই বোরকা', 2450, 2150, 30],
                    ['Dubai Cherry Stone Work Burqa', 'দুবাই চেরি স্টোন ওয়ার্ক বোরকা', 2950, 2650, 22],
                    ['Koti Style Georgette Burqa', 'কোটি স্টাইল জর্জেট বোরকা', 2250, 1990, 28],
                    ['Simple Daily Wear Abaya Burqa', 'সিম্পল ডেইলি ওয়্যার আবায়া বোরকা', 1650, 1490, 45],
                    ['Embroidered Hijab Set Burqa', 'এমব্রয়ডারি হিজাব সেট বোরকা', 2750, 2450, 25],
                ],
            ],
            'clothing-women-night-dress' => [
                'blurb_en' => 'Soft, skin-friendly nightwear designed for a relaxed and comfortable sleep.',
                'blurb_bn' => 'নরম ও ত্বকবান্ধব নাইটওয়্যার, আরামদায়ক ঘুমের জন্য বিশেষভাবে তৈরি।',
                'items' => [
                    ['Cotton Printed Night Dress', 'কটন প্রিন্টেড নাইট ড্রেস', 950, 850, 50],
                    ['Soft Maxi Night Gown', 'সফট ম্যাক্সি নাইট গাউন', 1250, 1090, 40],
                    ['Two Piece Nightwear Set', 'টু পিস নাইটওয়্যার সেট', 1450, 1290, 35],
                    ['Linen Comfort Night Dress', 'লিনেন কমফোর্ট নাইট ড্রেস', 1150, 990, 38],
                    ['Floral Sleeveless Night Dress', 'ফ্লোরাল স্লিভলেস নাইট ড্রেস', 1050, 920, 42],
                ],
            ],
            'clothing-women-three-piece' => [
                'blurb_en' => 'Complete three piece set — kameez, salwar and orna — in premium fabric with fine finishing.',
                'blurb_bn' => 'সম্পূর্ণ থ্রি পিস সেট — কামিজ, সালোয়ার ও ওড়না — প্রিমিয়াম কাপড় ও নিখুঁত ফিনিশিংয়ে।',
                'items' => [
                    ['Unstitched Cotton Three Piece', 'আনস্টিচড কটন থ্রি পিস', 1850, 1650, 35],
                    ['Digital Print Linen Three Piece', 'ডিজিটাল প্রিন্ট লিনেন থ্রি পিস', 2150, 1890, 30],
                    ['Embroidered Party Three Piece', 'এমব্রয়ডারি পার্টি থ্রি পিস', 2950, 2650, 22],
                    ['Handloom Cotton Three Piece', 'হ্যান্ডলুম কটন থ্রি পিস', 1650, 1450, 40],
                    ['Karchupi Silk Three Piece', 'কারচুপি সিল্ক থ্রি পিস', 3450, 3100, 18],
                ],
            ],

            /* ---------------- Clothing > Baby ---------------- */
            'clothing-baby-newborn-set' => [
                'blurb_en' => 'Gentle, skin-safe newborn set made from soft cotton — ideal as a baby shower gift.',
                'blurb_bn' => 'নরম কটনে তৈরি ত্বকের জন্য নিরাপদ নবজাতক সেট — উপহার হিসেবেও চমৎকার।',
                'items' => [
                    ['Newborn 5 Piece Cotton Gift Set', 'নবজাতক ৫ পিস কটন গিফট সেট', 1250, 1090, 40],
                    ['Organic Cotton Newborn Starter Set', 'অর্গানিক কটন নিউবর্ন স্টার্টার সেট', 1450, 1290, 30],
                    ['Winter Newborn Warm Set', 'উইন্টার নবজাতক ওয়ার্ম সেট', 1650, 1450, 25],
                    ['Newborn Nima Pajama Set', 'নবজাতক নিমা পায়জামা সেট', 850, 750, 55],
                    ['Hooded Newborn Bath Set', 'হুডেড নবজাতক বাথ সেট', 1150, 990, 32],
                ],
            ],
            'clothing-baby-shoes' => [
                'blurb_en' => 'Soft-sole baby shoes with anti-slip grip — light on tiny feet and easy to put on.',
                'blurb_bn' => 'নরম সোল ও অ্যান্টি-স্লিপ গ্রিপের বেবি শু — ছোট্ট পায়ে হালকা এবং সহজে পরানো যায়।',
                'items' => [
                    ['Soft Sole Baby Prewalker Shoes', 'সফট সোল বেবি প্রিওয়াকার শু', 750, 650, 45],
                    ['Anti-Slip Baby Sneakers', 'অ্যান্টি-স্লিপ বেবি স্নিকার্স', 950, 850, 38],
                    ['Baby Winter Booties', 'বেবি উইন্টার বুটিজ', 650, 550, 50],
                    ['Velcro Strap Toddler Shoes', 'ভেলক্রো স্ট্র্যাপ টডলার শু', 890, 790, 40],
                    ['Cartoon Print Baby Sandals', 'কার্টুন প্রিন্ট বেবি স্যান্ডেল', 690, 590, 48],
                ],
            ],
            'clothing-baby-feeding-bottle' => [
                'blurb_en' => 'BPA-free feeding bottle with an anti-colic nipple — safe, easy to clean and sterilise.',
                'blurb_bn' => 'বিপিএ ফ্রি ফিডিং বোতল, অ্যান্টি-কলিক নিপল সহ — নিরাপদ, সহজে পরিষ্কার ও জীবাণুমুক্ত করা যায়।',
                'items' => [
                    ['BPA Free Wide Neck Feeding Bottle 250ml', 'বিপিএ ফ্রি ওয়াইড নেক ফিডিং বোতল ২৫০ মিলি', 550, 480, 60],
                    ['Anti-Colic Silicone Feeding Bottle 150ml', 'অ্যান্টি-কলিক সিলিকন ফিডিং বোতল ১৫০ মিলি', 620, 540, 55],
                    ['Glass Feeding Bottle with Sleeve 240ml', 'স্লিভ সহ গ্লাস ফিডিং বোতল ২৪০ মিলি', 850, 750, 35],
                    ['Handle Grip Sipper Feeding Bottle 300ml', 'হ্যান্ডেল গ্রিপ সিপার ফিডিং বোতল ৩০০ মিলি', 720, 640, 45],
                    ['Newborn Feeding Bottle Starter Pack', 'নবজাতক ফিডিং বোতল স্টার্টার প্যাক', 1250, 1090, 28],
                ],
            ],
            'clothing-baby-toys' => [
                'blurb_en' => 'Non-toxic, age-appropriate toy that helps develop motor skills while keeping little ones busy.',
                'blurb_bn' => 'বিষমুক্ত ও বয়স-উপযোগী খেলনা, যা শিশুর মোটর স্কিল বিকাশে সাহায্য করে এবং ব্যস্ত রাখে।',
                'items' => [
                    ['Baby Musical Rattle Set', 'বেবি মিউজিক্যাল র‍্যাটল সেট', 550, 470, 55],
                    ['Soft Plush Teddy Bear', 'সফট প্লাশ টেডি বিয়ার', 890, 780, 40],
                    ['Wooden Stacking Ring Toy', 'উডেন স্ট্যাকিং রিং খেলনা', 750, 650, 35],
                    ['Remote Control Mini Car', 'রিমোট কন্ট্রোল মিনি কার', 1450, 1290, 25],
                    ['Educational Building Blocks Set', 'এডুকেশনাল বিল্ডিং ব্লক সেট', 1150, 990, 30],
                ],
            ],
            'clothing-baby-dress' => [
                'blurb_en' => 'Cute, breathable baby dress made from soft cotton that is gentle on delicate skin.',
                'blurb_bn' => 'নরম কটনে তৈরি আরামদায়ক ও সুন্দর বেবি ড্রেস, শিশুর কোমল ত্বকের জন্য নিরাপদ।',
                'items' => [
                    ['Baby Girl Frock Cotton Dress', 'বেবি গার্ল ফ্রক কটন ড্রেস', 850, 750, 45],
                    ['Baby Boy Shirt and Pant Set', 'বেবি বয় শার্ট ও প্যান্ট সেট', 950, 840, 40],
                    ['Baby Party Wear Tutu Dress', 'বেবি পার্টি ওয়্যার টুটু ড্রেস', 1250, 1090, 28],
                    ['Baby Winter Hoodie Dress', 'বেবি উইন্টার হুডি ড্রেস', 1150, 990, 32],
                    ['Baby Printed Romper', 'বেবি প্রিন্টেড রম্পার', 690, 590, 50],
                ],
            ],

            /* ---------------- Shoes ---------------- */
            'shoes-men' => [
                'blurb_en' => 'Durable men\'s footwear with a cushioned insole and firm grip outsole for all-day comfort.',
                'blurb_bn' => 'কুশনড ইনসোল ও মজবুত গ্রিপ আউটসোলের টেকসই পুরুষদের জুতা, সারাদিন আরামদায়ক।',
                'items' => [
                    ['Men\'s Black Formal Leather Shoes', 'পুরুষদের ব্ল্যাক ফরমাল লেদার সু', 2450, 2150, 30],
                    ['Men\'s Casual Canvas Sneakers', 'পুরুষদের ক্যাজুয়াল ক্যানভাস স্নিকার্স', 1650, 1450, 40],
                    ['Men\'s Brown Loafer Shoes', 'পুরুষদের ব্রাউন লোফার সু', 2150, 1890, 28],
                    ['Men\'s Leather Sandals', 'পুরুষদের লেদার স্যান্ডেল', 1250, 1090, 45],
                    ['Men\'s Outdoor Hiking Boots', 'পুরুষদের আউটডোর হাইকিং বুট', 3250, 2890, 20],
                ],
            ],
            'shoes-women' => [
                'blurb_en' => 'Stylish women\'s footwear with a soft footbed and balanced heel for comfortable long wear.',
                'blurb_bn' => 'নরম ফুটবেড ও ব্যালান্সড হিলের স্টাইলিশ নারীদের জুতা, দীর্ঘক্ষণ পরে থাকতে আরামদায়ক।',
                'items' => [
                    ['Women\'s Block Heel Sandals', 'নারীদের ব্লক হিল স্যান্ডেল', 1450, 1290, 35],
                    ['Women\'s Casual Flat Shoes', 'নারীদের ক্যাজুয়াল ফ্ল্যাট সু', 1150, 990, 45],
                    ['Women\'s Party Wear Pump Heels', 'নারীদের পার্টি ওয়্যার পাম্প হিল', 1850, 1650, 25],
                    ['Women\'s Slip-On Sneakers', 'নারীদের স্লিপ-অন স্নিকার্স', 1650, 1450, 32],
                    ['Women\'s Embroidered Khussa', 'নারীদের এমব্রয়ডারি খুসা', 1350, 1190, 30],
                ],
            ],
            'shoes-baby' => [
                'blurb_en' => 'Lightweight kids footwear with flexible soles that support natural walking.',
                'blurb_bn' => 'হালকা ও নমনীয় সোলের শিশুদের জুতা, স্বাভাবিক হাঁটাচলায় সহায়ক।',
                'items' => [
                    ['Baby First Walker Shoes', 'বেবি ফার্স্ট ওয়াকার সু', 790, 690, 45],
                    ['Kids Cartoon Sports Shoes', 'কিডস কার্টুন স্পোর্টস সু', 1050, 920, 38],
                    ['Baby Soft Cotton Socks Shoes', 'বেবি সফট কটন সকস সু', 550, 470, 55],
                    ['Kids Casual Slip-On Shoes', 'কিডস ক্যাজুয়াল স্লিপ-অন সু', 950, 820, 40],
                    ['Baby Party Wear Shoes', 'বেবি পার্টি ওয়্যার সু', 890, 780, 35],
                ],
            ],

            /* ---------------- Sports ---------------- */
            'sports-jersey' => [
                'blurb_en' => 'Breathable dry-fit jersey that wicks sweat away — made for match day and practice.',
                'blurb_bn' => 'ঘাম শোষণকারী ব্রিদেবল ড্রাই-ফিট জার্সি — ম্যাচ ও প্র্যাকটিস দুটোর জন্যই উপযুক্ত।',
                'items' => [
                    ['Bangladesh Cricket Fan Jersey', 'বাংলাদেশ ক্রিকেট ফ্যান জার্সি', 850, 750, 60],
                    ['Argentina Football Fan Jersey', 'আর্জেন্টিনা ফুটবল ফ্যান জার্সি', 950, 840, 55],
                    ['Brazil Football Fan Jersey', 'ব্রাজিল ফুটবল ফ্যান জার্সি', 950, 840, 55],
                    ['Dry Fit Training Jersey', 'ড্রাই ফিট ট্রেনিং জার্সি', 750, 650, 50],
                    ['Custom Name Print Sports Jersey', 'কাস্টম নেম প্রিন্ট স্পোর্টস জার্সি', 1050, 920, 40],
                ],
            ],
            'sports-trousers' => [
                'blurb_en' => 'Stretchable sports trouser with a comfortable waistband — great for gym, running and casual wear.',
                'blurb_bn' => 'আরামদায়ক ওয়েস্টব্যান্ড সহ স্ট্রেচেবল স্পোর্টস ট্রাউজার — জিম, দৌড় ও ক্যাজুয়াল ব্যবহারে দারুণ।',
                'items' => [
                    ['Dry Fit Sports Trouser', 'ড্রাই ফিট স্পোর্টস ট্রাউজার', 950, 850, 50],
                    ['Men\'s Track Pant with Zip Pocket', 'জিপ পকেট সহ পুরুষদের ট্র্যাক প্যান্ট', 1150, 990, 42],
                    ['Gym Joggers Trouser', 'জিম জগার্স ট্রাউজার', 1050, 920, 45],
                    ['Women\'s Yoga Leggings Trouser', 'নারীদের যোগা লেগিংস ট্রাউজার', 1250, 1090, 35],
                    ['Kids Sports Trouser', 'কিডস স্পোর্টস ট্রাউজার', 750, 650, 40],
                ],
            ],
            'sports-sneakers' => [
                'blurb_en' => 'Cushioned sports sneakers with a breathable upper and shock-absorbing sole.',
                'blurb_bn' => 'ব্রিদেবল আপার ও শক-অ্যাবজরবিং সোলের কুশনড স্পোর্টস স্নিকার্স।',
                'items' => [
                    ['Men\'s Sports Sneakers White', 'পুরুষদের স্পোর্টস স্নিকার্স হোয়াইট', 1950, 1750, 30],
                    ['Women\'s Lightweight Sneakers', 'নারীদের লাইটওয়েট স্নিকার্স', 1850, 1650, 32],
                    ['High Ankle Basketball Sneakers', 'হাই অ্যাঙ্কেল বাস্কেটবল স্নিকার্স', 2450, 2150, 22],
                    ['Mesh Breathable Gym Sneakers', 'মেশ ব্রিদেবল জিম স্নিকার্স', 1750, 1550, 35],
                    ['Kids Sports Sneakers', 'কিডস স্পোর্টস স্নিকার্স', 1250, 1090, 30],
                ],
            ],
            'sports-running-shoes' => [
                'blurb_en' => 'Lightweight running shoes with responsive cushioning for daily runs and long distance.',
                'blurb_bn' => 'হালকা ওজনের রানিং সু, রেসপন্সিভ কুশনিং সহ — প্রতিদিনের দৌড় ও লং ডিসট্যান্সের জন্য।',
                'items' => [
                    ['Men\'s Marathon Running Shoes', 'পুরুষদের ম্যারাথন রানিং সু', 2650, 2350, 25],
                    ['Women\'s Cushioned Running Shoes', 'নারীদের কুশনড রানিং সু', 2450, 2190, 28],
                    ['Trail Running Shoes', 'ট্রেইল রানিং সু', 2950, 2650, 20],
                    ['Lightweight Daily Running Shoes', 'লাইটওয়েট ডেইলি রানিং সু', 1950, 1750, 34],
                    ['Kids Running Shoes', 'কিডস রানিং সু', 1350, 1190, 30],
                ],
            ],

            /* ---------------- Standalone main categories ---------------- */
            'watches' => [
                'blurb_en' => 'Water-resistant watch with a durable movement and a comfortable strap — ideal for daily use or gifting.',
                'blurb_bn' => 'টেকসই মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের ওয়াটার-রেজিস্ট্যান্ট ঘড়ি — দৈনন্দিন ব্যবহার ও উপহারের জন্য আদর্শ।',
                'items' => [
                    ['Men\'s Classic Leather Strap Watch', 'পুরুষদের ক্লাসিক লেদার স্ট্র্যাপ ঘড়ি', 2450, 2150, 30],
                    ['Women\'s Rose Gold Bracelet Watch', 'নারীদের রোজ গোল্ড ব্রেসলেট ঘড়ি', 2850, 2450, 25],
                    ['Digital Sports Watch', 'ডিজিটাল স্পোর্টস ঘড়ি', 1250, 1090, 45],
                    ['Smart Watch with Heart Rate Monitor', 'হার্ট রেট মনিটর সহ স্মার্ট ওয়াচ', 3450, 2990, 28],
                    ['Couple Watch Gift Set', 'কাপল ওয়াচ গিফট সেট', 3950, 3450, 18],
                ],
            ],
            'gadgets' => [
                'blurb_en' => 'Handy everyday gadget with reliable build quality and a standard warranty.',
                'blurb_bn' => 'নির্ভরযোগ্য বিল্ড কোয়ালিটির প্রয়োজনীয় দৈনন্দিন গ্যাজেট, স্ট্যান্ডার্ড ওয়ারেন্টি সহ।',
                'items' => [
                    ['Wireless Bluetooth Earbuds', 'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস', 1850, 1590, 40],
                    ['10000mAh Fast Charging Power Bank', '১০০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক', 1450, 1290, 45],
                    ['Bluetooth Portable Speaker', 'ব্লুটুথ পোর্টেবল স্পিকার', 1650, 1450, 35],
                    ['Mobile Tripod Stand with Ring Light', 'রিং লাইট সহ মোবাইল ট্রাইপড স্ট্যান্ড', 1250, 1090, 38],
                    ['USB-C Fast Charging Cable 3A', 'ইউএসবি-সি ফাস্ট চার্জিং ক্যাবল ৩এ', 350, 290, 80],
                ],
            ],
            'food-organic' => [
                'blurb_en' => 'Pure, chemical-free organic food item sourced directly from trusted local producers.',
                'blurb_bn' => 'বিশ্বস্ত স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সংগ্রহ করা খাঁটি ও কেমিক্যালমুক্ত অর্গানিক খাদ্যপণ্য।',
                'items' => [
                    ['Pure Sundarban Honey 500g', 'খাঁটি সুন্দরবনের মধু ৫০০ গ্রাম', 850, 750, 50],
                    ['Organic Ghee 500ml', 'অর্গানিক ঘি ৫০০ মিলি', 1250, 1090, 40],
                    ['Cold Pressed Mustard Oil 1L', 'কোল্ড প্রেসড সরিষার তেল ১ লিটার', 450, 390, 60],
                    ['Chinigura Aromatic Rice 5kg', 'চিনিগুড়া সুগন্ধি চাল ৫ কেজি', 750, 690, 45],
                    ['Organic Date Molasses 1kg', 'অর্গানিক খেজুর গুড় ১ কেজি', 650, 570, 35],
                ],
            ],
            'healthcare-supplements' => [
                'blurb_en' => 'Quality health supplement with clear labelling. Please follow the dosage on the pack or consult a doctor.',
                'blurb_bn' => 'স্পষ্ট লেবেলযুক্ত মানসম্মত হেলথ সাপ্লিমেন্ট। প্যাকের নির্দেশনা অনুসরণ করুন অথবা চিকিৎসকের পরামর্শ নিন।',
                'items' => [
                    ['Vitamin C 1000mg Tablets', 'ভিটামিন সি ১০০০ মিগ্রা ট্যাবলেট', 850, 750, 50],
                    ['Omega 3 Fish Oil Softgel', 'ওমেগা ৩ ফিশ অয়েল সফটজেল', 1250, 1090, 40],
                    ['Multivitamin Daily Tablets', 'মাল্টিভিটামিন ডেইলি ট্যাবলেট', 950, 840, 45],
                    ['Whey Protein Powder 1kg', 'হুই প্রোটিন পাউডার ১ কেজি', 3450, 3150, 20],
                    ['Calcium and Vitamin D3 Tablets', 'ক্যালসিয়াম ও ভিটামিন ডি৩ ট্যাবলেট', 750, 650, 48],
                ],
            ],
        ];
    }

    public function up(): void
    {
        $placeholder = '/placeholder.svg';

        DB::transaction(function () use ($placeholder) {
            foreach ($this->catalog() as $categorySlug => $group) {
                $category = DB::table('categories')->where('slug', $categorySlug)->first();

                if (!$category) {
                    continue;
                }

                // Do not touch a category that already has products.
                if (DB::table('products')->where('category_id', $category->id)->exists()) {
                    continue;
                }

                $sortedItems = $group['items'];

                foreach ($sortedItems as $item) {
                    [$nameEn, $nameBn, $basePrice, $salePrice, $stock] = $item;

                    $slug = $this->uniqueSlug($nameEn, $categorySlug);

                    if ($slug === null) {
                        continue; // already seeded under one of the candidate slugs
                    }

                    $descriptionEn = $nameEn . '. ' . $group['blurb_en'];
                    $descriptionBn = $nameBn . '। ' . $group['blurb_bn'];

                    DB::table('products')->insert([
                        'id' => (string) Str::uuid(),
                        'name' => $nameEn,
                        'name_en' => $nameEn,
                        'name_bn' => $nameBn,
                        'slug' => $slug,
                        'short_description' => $group['blurb_en'],
                        'short_description_en' => $group['blurb_en'],
                        'short_description_bn' => $group['blurb_bn'],
                        'description' => $descriptionEn,
                        'description_en' => $descriptionEn,
                        'description_bn' => $descriptionBn,
                        'base_price' => $basePrice,
                        'sale_price' => $salePrice,
                        'stock_quantity' => $stock,
                        'category_id' => $category->id,
                        'image_url' => $placeholder,
                        'images' => json_encode([$placeholder]),
                        'is_featured' => false,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        foreach ($this->catalog() as $categorySlug => $group) {
            $category = DB::table('categories')->where('slug', $categorySlug)->first();

            if (!$category) {
                continue;
            }

            $slugs = [];

            foreach ($group['items'] as $item) {
                $base = Str::slug($item[0]);
                $slugs[] = $base;
                $slugs[] = $base . '-' . $categorySlug;
            }

            DB::table('products')
                ->where('category_id', $category->id)
                ->whereIn('slug', $slugs)
                ->delete();
        }
    }

    /**
     * Returns a free slug for the product, or null when the product already exists.
     */
    private function uniqueSlug(string $nameEn, string $categorySlug): ?string
    {
        $base = Str::slug($nameEn);

        if (!DB::table('products')->where('slug', $base)->exists()) {
            return $base;
        }

        $scoped = $base . '-' . $categorySlug;

        if (!DB::table('products')->where('slug', $scoped)->exists()) {
            return $scoped;
        }

        return null;
    }
};
