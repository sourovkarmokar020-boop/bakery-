<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Fills the empty grid cells ("gaps") left on the homepage and the category
 * pages.
 *
 * Both grids are `lg:grid-cols-4`, so a category holding a number of products
 * that is not a multiple of four leaves visible white space at the end of its
 * last row. This migration tops every category up to the next multiple of four
 * (minimum four) and does the same for the featured "অফারে কিনুন" row.
 *
 * Only as many products as a category actually needs are inserted, so running
 * this after new products were added by hand stays safe.
 *
 * Images are left on the shared placeholder (`/placeholder.svg`) on purpose —
 * the real photos get uploaded from the admin panel afterwards.
 */
return new class extends Migration
{
    /** Columns in the desktop product grid. */
    private const ROW = 4;

    /** Categories preferred when the featured row needs to be topped up. */
    private const FEATURED_PREFERENCE = ['watches', 'gadgets', 'healthcare-supplements', 'food-organic'];

    /**
     * category slug => [blurb_en, blurb_bn, items[ [name_en, name_bn, base_price, sale_price, stock] ]]
     *
     * Every category lists more candidates than it needs; `up()` stops as soon
     * as the row is full.
     */
    private function catalog(): array
    {
        return [
            /* ---------------- Watches ---------------- */
            'watches' => [
                'blurb_en' => 'Everyday wristwatch with a reliable movement and a comfortable strap. Backed by a service warranty.',
                'blurb_bn' => 'নির্ভরযোগ্য মুভমেন্ট ও আরামদায়ক স্ট্র্যাপের দৈনন্দিন হাতঘড়ি। সার্ভিস ওয়ারেন্টিসহ।',
                'items' => [
                    ["Men's Stainless Steel Chain Watch", 'পুরুষদের স্টেইনলেস স্টিল চেইন ঘড়ি', 2650, 2290, 25],
                    ['Classic Brown Leather Strap Watch', 'ক্লাসিক ব্রাউন লেদার স্ট্র্যাপ ঘড়ি', 1950, 1690, 30],
                    ['Couple Watch Gift Set', 'কাপল ওয়াচ গিফট সেট', 3250, 2790, 18],
                    ['Kids Cartoon Digital Watch', 'কিডস কার্টুন ডিজিটাল ঘড়ি', 750, 650, 40],
                ],
            ],

            /* ---------------- Gadgets ---------------- */
            'gadgets' => [
                'blurb_en' => 'Handy daily-use gadget with tested build quality and a warranty on manufacturing defects.',
                'blurb_bn' => 'প্রতিদিনের ব্যবহারের কাজের গ্যাজেট, পরীক্ষিত বিল্ড কোয়ালিটি ও ম্যানুফ্যাকচারিং ত্রুটির ওয়ারেন্টিসহ।',
                'items' => [
                    ['Wireless Charging Pad 15W', 'ওয়্যারলেস চার্জিং প্যাড ১৫ ওয়াট', 1250, 1050, 25],
                    ['RGB Gaming Mouse', 'আরজিবি গেমিং মাউস', 1450, 1250, 30],
                    ['Mini Portable Fan with Power Bank', 'মিনি পোর্টেবল ফ্যান উইথ পাওয়ার ব্যাংক', 950, 790, 35],
                    ['Smart LED Selfie Ring Light', 'স্মার্ট এলইডি সেলফি রিং লাইট', 1150, 950, 28],
                ],
            ],

            /* ---------------- Food & Organic ---------------- */
            'food-organic' => [
                'blurb_en' => 'Naturally sourced and carefully packed, free from artificial colour and preservatives.',
                'blurb_bn' => 'প্রাকৃতিকভাবে সংগৃহীত ও যত্নসহকারে প্যাকেট করা, কৃত্রিম রং ও প্রিজারভেটিভমুক্ত।',
                'items' => [
                    ['Organic Turmeric Powder 500g', 'অর্গানিক হলুদ গুঁড়া ৫০০ গ্রাম', 350, 299, 60],
                    ['Premium Kalojira Black Seed Oil 250ml', 'প্রিমিয়াম কালোজিরার তেল ২৫০ মিলি', 550, 480, 40],
                    ['Natural Dried Dates 1kg', 'ন্যাচারাল শুকনা খেজুর ১ কেজি', 950, 830, 35],
                    ['Organic Masoor Dal 2kg', 'অর্গানিক মসুর ডাল ২ কেজি', 420, 370, 50],
                ],
            ],

            /* ---------------- Healthcare & Supplements ---------------- */
            'healthcare-supplements' => [
                'blurb_en' => 'Authentic supplement with a readable batch and expiry date on every pack.',
                'blurb_bn' => 'আসল সাপ্লিমেন্ট, প্রতিটি প্যাকে স্পষ্ট ব্যাচ ও মেয়াদ উত্তীর্ণের তারিখ দেওয়া।',
                'items' => [
                    ['Omega 3 Fish Oil Capsules', 'ওমেগা ৩ ফিশ অয়েল ক্যাপসুল', 1450, 1250, 40],
                    ['Zinc and Vitamin B Complex Tablets', 'জিংক ও ভিটামিন বি কমপ্লেক্স ট্যাবলেট', 650, 560, 50],
                    ['Digital Blood Pressure Monitor', 'ডিজিটাল ব্লাড প্রেশার মনিটর', 2950, 2590, 20],
                    ['Collagen Beauty Powder 300g', 'কোলাজেন বিউটি পাউডার ৩০০ গ্রাম', 2450, 2150, 18],
                ],
            ],

            /* ---------------- Bags ---------------- */
            'bags' => [
                'blurb_en' => 'Roomy bag with reinforced stitching and smooth zippers, made to survive daily commuting.',
                'blurb_bn' => 'প্রশস্ত ব্যাগ, মজবুত সেলাই ও মসৃণ জিপার — প্রতিদিনের যাতায়াতের জন্য টেকসই।',
                'items' => [
                    ['Water Resistant Travel Duffel Bag', 'ওয়াটার রেজিস্ট্যান্ট ট্রাভেল ডাফেল ব্যাগ', 2250, 1890, 15],
                    ['Anti Theft USB Laptop Backpack', 'অ্যান্টি থেফট ইউএসবি ল্যাপটপ ব্যাকপ্যাক', 2650, 2290, 16],
                    ['School Backpack for Students', 'স্টুডেন্ট স্কুল ব্যাকপ্যাক', 1250, 1050, 30],
                    ['Mini Sling Crossbody Purse', 'মিনি স্লিং ক্রসবডি পার্স', 890, 750, 26],
                ],
            ],

            /* ---------------- Clothing > Men ---------------- */
            'clothing-men-tshirt' => [
                'blurb_en' => 'Soft cotton t-shirt with a colour-fast print and a relaxed everyday fit.',
                'blurb_bn' => 'নরম কটন টি-শার্ট, রং না ওঠা প্রিন্ট ও আরামদায়ক দৈনন্দিন ফিট।',
                'items' => [
                    ["Men's Full Sleeve Cotton T-Shirt", 'পুরুষদের ফুল স্লিভ কটন টি-শার্ট', 950, 820, 40],
                    ["Men's Sports Dry Fit T-Shirt", 'পুরুষদের স্পোর্টস ড্রাই ফিট টি-শার্ট', 850, 730, 45],
                    ["Men's Striped Polo T-Shirt", 'পুরুষদের স্ট্রাইপড পোলো টি-শার্ট', 1050, 890, 38],
                    ["Men's Oversized Printed T-Shirt", 'পুরুষদের ওভারসাইজড প্রিন্টেড টি-শার্ট', 890, 760, 42],
                ],
            ],
            'clothing-men-shirt' => [
                'blurb_en' => 'Well-cut men\'s shirt in breathable fabric, equally at home in the office and outside it.',
                'blurb_bn' => 'সুন্দর কাটের পুরুষদের শার্ট, আরামদায়ক কাপড় — অফিস ও বাইরে দুই জায়গাতেই মানানসই।',
                'items' => [
                    ["Men's White Formal Full Sleeve Shirt", 'পুরুষদের সাদা ফরমাল ফুল স্লিভ শার্ট', 1350, 1190, 35],
                    ["Men's Black Denim Casual Shirt", 'পুরুষদের ব্ল্যাক ডেনিম ক্যাজুয়াল শার্ট', 1550, 1350, 28],
                    ["Men's Printed Half Sleeve Shirt", 'পুরুষদের প্রিন্টেড হাফ স্লিভ শার্ট', 1150, 990, 40],
                    ["Men's Navy Oxford Cotton Shirt", 'পুরুষদের নেভি অক্সফোর্ড কটন শার্ট', 1450, 1250, 32],
                ],
            ],
            'clothing-men-pants' => [
                'blurb_en' => 'Comfortable everyday men\'s pant with a clean cut and durable stitching, in all standard sizes.',
                'blurb_bn' => 'আরামদায়ক দৈনন্দিন পুরুষদের প্যান্ট, পরিচ্ছন্ন কাট ও টেকসই সেলাই। সব স্ট্যান্ডার্ড সাইজে পাওয়া যাচ্ছে।',
                'items' => [
                    ['Navy Blue Chino Pant', 'নেভি ব্লু চিনো প্যান্ট', 1350, 1190, 45],
                    ['Charcoal Grey Office Pant', 'চারকোল গ্রে অফিস প্যান্ট', 1490, 1340, 35],
                    ['Olive Green Cargo Pant', 'অলিভ গ্রিন কার্গো প্যান্ট', 1550, 1390, 30],
                    ['Stretch Denim Jeans Pant', 'স্ট্রেচ ডেনিম জিন্স প্যান্ট', 1650, 1450, 32],
                ],
            ],
            'clothing-men-jackets' => [
                'blurb_en' => 'Warm, well-finished men\'s jacket built for the winter season and casual outings alike.',
                'blurb_bn' => 'উষ্ণ ও সুন্দর ফিনিশিংয়ের পুরুষদের জ্যাকেট, শীতের মৌসুম ও ক্যাজুয়াল ব্যবহারের জন্য উপযুক্ত।',
                'items' => [
                    ['Navy Denim Jacket', 'নেভি ডেনিম জ্যাকেট', 2450, 2190, 28],
                    ['Olive Bomber Jacket', 'অলিভ বোম্বার জ্যাকেট', 2650, 2350, 25],
                    ['Grey Hooded Windbreaker Jacket', 'গ্রে হুডেড উইন্ডব্রেকার জ্যাকেট', 2250, 1990, 30],
                    ['Black Quilted Puffer Jacket', 'ব্ল্যাক কুইল্টেড পাফার জ্যাকেট', 2950, 2590, 22],
                ],
            ],

            /* ---------------- Clothing > Women ---------------- */
            'clothing-women-salwar-kameez' => [
                'blurb_en' => 'Skin-friendly salwar kameez with neat finishing, comfortable through a full day of wear.',
                'blurb_bn' => 'ত্বকবান্ধব সালোয়ার কামিজ, পরিপাটি ফিনিশিং — সারাদিন পরে থাকলেও আরামদায়ক।',
                'items' => [
                    ['Printed Cotton Salwar Kameez', 'প্রিন্টেড কটন সালোয়ার কামিজ', 1650, 1450, 30],
                    ['Georgette Party Salwar Kameez', 'জর্জেট পার্টি সালোয়ার কামিজ', 2650, 2350, 20],
                    ['Linen Casual Salwar Kameez', 'লিনেন ক্যাজুয়াল সালোয়ার কামিজ', 1950, 1750, 26],
                    ['Hand Embroidered Silk Salwar Kameez', 'হ্যান্ড এমব্রয়ডারি সিল্ক সালোয়ার কামিজ', 3250, 2890, 15],
                ],
            ],
            'clothing-women-burqa' => [
                'blurb_en' => 'Modest, flowing burqa in a lightweight fabric that stays comfortable in warm weather.',
                'blurb_bn' => 'হালকা কাপড়ের আরামদায়ক বোরকা, গরমেও পরে স্বস্তি মেলে।',
                'items' => [
                    ['Dubai Style Stone Work Burqa', 'দুবাই স্টাইল স্টোন ওয়ার্ক বোরকা', 3250, 2890, 18],
                    ['Koti Style Cotton Burqa', 'কোটি স্টাইল কটন বোরকা', 1950, 1750, 25],
                    ['Georgette Party Abaya Burqa', 'জর্জেট পার্টি আবায়া বোরকা', 2750, 2450, 20],
                    ['Two Piece Hijab and Burqa Set', 'টু পিস হিজাব ও বোরকা সেট', 2250, 1990, 22],
                ],
            ],
            'clothing-women-three-piece' => [
                'blurb_en' => 'Complete three-piece set — kameez, salwar and orna — matched and ready to wear.',
                'blurb_bn' => 'সম্পূর্ণ থ্রি-পিস সেট — কামিজ, সালোয়ার ও ওড়না — ম্যাচিং করা ও পরার উপযোগী।',
                'items' => [
                    ['Cotton Block Print Three Piece', 'কটন ব্লক প্রিন্ট থ্রি-পিস', 1850, 1650, 28],
                    ['Embroidered Georgette Three Piece', 'এমব্রয়ডারি জর্জেট থ্রি-পিস', 2650, 2350, 22],
                    ['Lawn Unstitched Three Piece', 'লন আনস্টিচড থ্রি-পিস', 1550, 1390, 32],
                    ['Designer Party Wear Three Piece', 'ডিজাইনার পার্টি ওয়্যার থ্রি-পিস', 3450, 3050, 16],
                ],
            ],

            /* ---------------- Clothing > Baby ---------------- */
            'clothing-baby-newborn-set' => [
                'blurb_en' => 'Soft, skin-safe newborn set stitched from breathable cotton with flat seams.',
                'blurb_bn' => 'নরম ও ত্বকের জন্য নিরাপদ নবজাতকের সেট, শ্বাস-প্রশ্বাসযোগ্য কটন ও ফ্ল্যাট সেলাই।',
                'items' => [
                    ['Newborn 7 Piece Winter Gift Set', 'নবজাতক ৭ পিস উইন্টার গিফট সেট', 1650, 1450, 25],
                    ['Baby Cotton Sleepsuit 3 Piece Set', 'বেবি কটন স্লিপসুট ৩ পিস সেট', 950, 830, 35],
                    ['Newborn Hooded Towel and Wash Set', 'নবজাতক হুডেড টাওয়েল ও ওয়াশ সেট', 750, 650, 30],
                    ['Baby Muslin Wrap Blanket Set', 'বেবি মসলিন র‍্যাপ ব্ল্যাঙ্কেট সেট', 1150, 990, 28],
                ],
            ],
            'clothing-baby-feeding-bottle' => [
                'blurb_en' => 'BPA-free feeding bottle with an anti-colic nipple, easy to sterilise and clean.',
                'blurb_bn' => 'বিপিএ-মুক্ত ফিডিং বোতল, অ্যান্টি-কলিক নিপল — সহজে জীবাণুমুক্ত ও পরিষ্কার করা যায়।',
                'items' => [
                    ['Anti Colic Wide Neck Bottle 260ml', 'অ্যান্টি কলিক ওয়াইড নেক ফিডার ২৬০ মিলি', 650, 550, 45],
                    ['Silicone Sipper Bottle with Straw', 'সিলিকন সিপার বোতল স্ট্র সহ', 750, 640, 40],
                    ['Stainless Steel Insulated Baby Bottle', 'স্টেইনলেস স্টিল ইনসুলেটেড বেবি বোতল', 1150, 990, 30],
                    ['Bottle Cleaning Brush and Nipple Set', 'বোতল পরিষ্কারের ব্রাশ ও নিপল সেট', 350, 299, 60],
                ],
            ],
            'clothing-baby-toys' => [
                'blurb_en' => 'Non-toxic toy with rounded edges, safe for little hands and easy to wipe clean.',
                'blurb_bn' => 'ননটক্সিক খেলনা, গোলাকার প্রান্ত — ছোট্ট হাতের জন্য নিরাপদ ও সহজে পরিষ্কার করা যায়।',
                'items' => [
                    ['Soft Plush Teddy Bear 40cm', 'সফট প্লাশ টেডি বিয়ার ৪০ সেমি', 950, 820, 30],
                    ['Musical Baby Rattle Set', 'মিউজিক্যাল বেবি র‍্যাটেল সেট', 550, 470, 45],
                    ['Educational Alphabet Puzzle Board', 'এডুকেশনাল অ্যালফাবেট পাজল বোর্ড', 650, 550, 40],
                    ['Remote Control Racing Car Toy', 'রিমোট কন্ট্রোল রেসিং কার টয়', 1450, 1250, 22],
                ],
            ],
            'clothing-baby-dress' => [
                'blurb_en' => 'Playful baby dress in soft cotton, gentle on the skin and easy to wash.',
                'blurb_bn' => 'নরম কটনের সুন্দর বেবি ড্রেস, ত্বকে আরামদায়ক ও সহজে ধোয়া যায়।',
                'items' => [
                    ['Baby Boy Casual Shirt and Pant Set', 'বেবি বয় ক্যাজুয়াল শার্ট ও প্যান্ট সেট', 950, 820, 32],
                    ['Baby Winter Fleece Romper', 'বেবি উইন্টার ফ্লিস রম্পার', 1150, 990, 26],
                    ['Kids Denim Dungaree Dress', 'কিডস ডেনিম ডাংগারি ড্রেস', 1250, 1090, 24],
                    ['Baby Cotton Printed Frock', 'বেবি কটন প্রিন্টেড ফ্রক', 790, 690, 38],
                ],
            ],

            /* ---------------- Shoes ---------------- */
            'shoes-men' => [
                'blurb_en' => 'Durable men\'s footwear with a cushioned insole and a firm anti-slip outsole.',
                'blurb_bn' => 'টেকসই পুরুষদের জুতা, কুশনযুক্ত ইনসোল ও মজবুত অ্যান্টি-স্লিপ আউটসোল।',
                'items' => [
                    ["Men's Formal Leather Shoes", 'পুরুষদের ফরমাল লেদার সু', 2850, 2450, 24],
                    ["Men's Casual Loafers", 'পুরুষদের ক্যাজুয়াল লোফার', 2150, 1890, 28],
                    ["Men's Leather Sandal", 'পুরুষদের লেদার স্যান্ডেল', 1450, 1250, 35],
                    ["Men's Everyday Flip Flop", 'পুরুষদের ডেইলি ফ্লিপ ফ্লপ', 550, 450, 50],
                ],
            ],
            'shoes-women' => [
                'blurb_en' => 'Lightweight women\'s footwear with a soft footbed, comfortable for all-day wear.',
                'blurb_bn' => 'হালকা ওজনের নারীদের জুতা, নরম ফুটবেড — সারাদিন পরে থাকার মতো আরামদায়ক।',
                'items' => [
                    ["Women's Flat Belly Shoes", 'নারীদের ফ্ল্যাট বেলি সু', 1250, 1090, 32],
                    ["Women's Wedge Heel Sandals", 'নারীদের ওয়েজ হিল স্যান্ডেল', 1650, 1450, 26],
                    ["Women's Casual Canvas Shoes", 'নারীদের ক্যাজুয়াল ক্যানভাস সু', 1450, 1250, 30],
                    ["Women's Soft Home Slippers", 'নারীদের সফট হোম স্লিপার', 650, 550, 45],
                ],
            ],
            'shoes-baby' => [
                'blurb_en' => 'Flexible baby shoe with a soft sole that supports early steps without pinching.',
                'blurb_bn' => 'নমনীয় বেবি সু, নরম সোল — হাঁটা শেখার সময় পা চেপে ধরে না।',
                'items' => [
                    ['Baby Soft Sole Pre Walker Shoes', 'বেবি সফট সোল প্রি-ওয়াকার সু', 750, 650, 35],
                    ['Kids Velcro Sports Shoes', 'কিডস ভেলক্রো স্পোর্টস সু', 1150, 990, 30],
                    ['Baby Winter Booties', 'বেবি উইন্টার বুটিজ', 650, 550, 40],
                    ['Kids Cartoon Light Up Shoes', 'কিডস কার্টুন লাইট আপ সু', 1350, 1150, 25],
                ],
            ],

            /* ---------------- Sports ---------------- */
            'sports-jersey' => [
                'blurb_en' => 'Breathable sports jersey with sublimation print that will not crack after washing.',
                'blurb_bn' => 'শ্বাস-প্রশ্বাসযোগ্য স্পোর্টস জার্সি, সাবলিমেশন প্রিন্ট — ধোয়ার পরেও প্রিন্ট ফাটে না।',
                'items' => [
                    ['Brazil Football Fan Jersey', 'ব্রাজিল ফুটবল ফ্যান জার্সি', 950, 840, 40],
                    ['Bangladesh Cricket Fan Jersey', 'বাংলাদেশ ক্রিকেট ফ্যান জার্সি', 1050, 920, 38],
                    ['Custom Name and Number Jersey', 'কাস্টম নাম ও নম্বর জার্সি', 1150, 990, 30],
                    ['Kids Football Jersey Set', 'কিডস ফুটবল জার্সি সেট', 850, 740, 35],
                ],
            ],
            'sports-trousers' => [
                'blurb_en' => 'Stretchable sports trouser with side pockets and a secure drawstring waist.',
                'blurb_bn' => 'স্ট্রেচেবল স্পোর্টস ট্রাউজার, সাইড পকেট ও মজবুত ড্রস্ট্রিং কোমর।',
                'items' => [
                    ['Mens Joggers Trouser', 'পুরুষদের জগার্স ট্রাউজার', 1050, 890, 38],
                    ['Track Pant with Zipper Pocket', 'জিপার পকেটসহ ট্র্যাক প্যান্ট', 1150, 990, 32],
                    ['Womens Yoga Leggings', 'নারীদের যোগা লেগিংস', 950, 820, 40],
                    ['Cotton Sports Shorts', 'কটন স্পোর্টস শর্টস', 650, 550, 45],
                ],
            ],
            'sports-sneakers' => [
                'blurb_en' => 'Everyday sneaker with a cushioned midsole and a grippy rubber outsole.',
                'blurb_bn' => 'দৈনন্দিন স্নিকার, কুশনযুক্ত মিডসোল ও গ্রিপযুক্ত রাবার আউটসোল।',
                'items' => [
                    ['Classic White Canvas Sneakers', 'ক্লাসিক হোয়াইট ক্যানভাস স্নিকার্স', 1650, 1450, 30],
                    ['Womens Lightweight Sneakers', 'নারীদের লাইটওয়েট স্নিকার্স', 1850, 1590, 26],
                    ['Chunky Sole Fashion Sneakers', 'চাঙ্কি সোল ফ্যাশন স্নিকার্স', 2250, 1950, 22],
                    ['Kids School Sneakers', 'কিডস স্কুল স্নিকার্স', 1250, 1090, 35],
                ],
            ],
            'sports-running-shoes' => [
                'blurb_en' => 'Running shoe built for daily mileage — light upper, breathable mesh, shock absorbing sole.',
                'blurb_bn' => 'প্রতিদিন দৌড়ানোর জন্য তৈরি রানিং শু — হালকা আপার, শ্বাস-প্রশ্বাসযোগ্য মেশ ও শক অ্যাবজর্বিং সোল।',
                'items' => [
                    ['Lightweight Daily Trainer Shoes', 'লাইটওয়েট ডেইলি ট্রেইনার শু', 2750, 2450, 24],
                    ['Gym Training Shoes', 'জিম ট্রেনিং শু', 2350, 2050, 28],
                    ['Kids Running Shoes', 'কিডস রানিং শু', 1650, 1450, 30],
                    ['Breathable Mesh Walking Shoes', 'ব্রিদেবল মেশ ওয়াকিং শু', 2150, 1890, 26],
                ],
            ],
        ];
    }

    public function up(): void
    {
        $placeholder = '/placeholder.svg';

        DB::transaction(function () use ($placeholder) {
            /** @var array<string, string[]> $insertedByCategory */
            $insertedByCategory = [];

            foreach ($this->catalog() as $categorySlug => $group) {
                $category = DB::table('categories')->where('slug', $categorySlug)->first();

                if (!$category) {
                    continue;
                }

                $existing = (int) DB::table('products')
                    ->where('category_id', $category->id)
                    ->where('is_active', true)
                    ->count();

                $needed = $this->gapToFillRow($existing);

                if ($needed === 0) {
                    continue;
                }

                foreach ($group['items'] as $item) {
                    if ($needed === 0) {
                        break;
                    }

                    [$nameEn, $nameBn, $basePrice, $salePrice, $stock] = $item;

                    $slug = $this->uniqueSlug($nameEn, $categorySlug);

                    if ($slug === null) {
                        continue; // the candidate already exists — try the next one
                    }

                    $descriptionEn = $nameEn . '. ' . $group['blurb_en'];
                    $descriptionBn = $nameBn . '। ' . $group['blurb_bn'];
                    $id = (string) Str::uuid();

                    DB::table('products')->insert([
                        'id' => $id,
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

                    $insertedByCategory[$categorySlug][] = $id;
                    $needed--;
                }
            }

            $this->fillFeaturedRow($insertedByCategory);
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
                ->where('image_url', '/placeholder.svg')
                ->delete();
        }
    }

    /**
     * The featured row ("অফারে কিনুন") uses the same four-column grid, so it
     * needs a multiple of four too. Products inserted above are promoted, which
     * keeps `down()` able to undo the change by simply deleting them.
     */
    private function fillFeaturedRow(array $insertedByCategory): void
    {
        $featured = (int) DB::table('products')
            ->where('is_featured', true)
            ->where('is_active', true)
            ->count();

        $needed = $this->gapToFillRow($featured);

        if ($needed === 0) {
            return;
        }

        $candidates = [];

        foreach (self::FEATURED_PREFERENCE as $categorySlug) {
            foreach ($insertedByCategory[$categorySlug] ?? [] as $id) {
                $candidates[] = $id;
            }
        }

        foreach ($insertedByCategory as $ids) {
            foreach ($ids as $id) {
                $candidates[] = $id;
            }
        }

        $promote = array_slice(array_values(array_unique($candidates)), 0, $needed);

        if ($promote !== []) {
            DB::table('products')->whereIn('id', $promote)->update([
                'is_featured' => true,
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * How many products a grid of `$count` items needs before its last row is
     * full. An empty or short category is always taken up to a whole row.
     */
    private function gapToFillRow(int $count): int
    {
        $target = max(self::ROW, (int) ceil($count / self::ROW) * self::ROW);

        return max(0, $target - $count);
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
