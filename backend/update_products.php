<?php

use Illuminate\Support\Facades\DB;

$translations = [
    "Modern Decorative Flower Vase" => "আধুনিক আলংকারিক ফুলদানি",
    "Handmade Resin Wall Clock" => "হস্তনির্মিত রেজিন দেয়াল ঘড়ি",
    "Modern Digital Table Clock" => "আধুনিক ডিজিটাল টেবিল ঘড়ি",
    "Colorful Crystal LED Candle Light" => "কালারফুল ক্রিস্টাল এলইডি ক্যান্ডেল লাইট",
    "Classic Vintage Table Clock" => "ক্লাসিক ভিন্টেজ টেবিল ঘড়ি",
    "Silent Desk Clock for Bedroom" => "বেডরুমের জন্য সাইলেন্ট ডেস্ক ঘড়ি",
    "Borosilicate Glass Storage Jar with Lid" => "ঢাকনা সহ বোরোসিলিকেট কাঁচের জার",
    "Clear Glass Coffee Mug Set" => "ক্লিয়ার গ্লাস কফি মগ সেট",
    "Golden Deer Statue Showpiece" => "সোনালী হরিণ মূর্তি শোপিস",
    "Elegant Table Decor Showpiece" => "মার্জিত টেবিল সজ্জা শোপিস",
    "Luxury Analog Watch for Men" => "পুরুষদের জন্য লাক্সারি অ্যানালগ ঘড়ি",
    "Rechargeable LED Desk Lamp" => "রিচার্জেবল এলইডি ডেস্ক ল্যাম্প",
    "Decorative Resin Serving Tray" => "ডেকোরেটিভ রেজিন পরিবেশন ট্রে",
    "Smart Casual Men’s Wrist Watch" => "স্মার্ট ক্যাজুয়াল পুরুষদের কবজি ঘড়ি",
    "Classic Stainless Steel Men’s Watch" => "ক্লাসিক স্টেইনলেস স্টীল পুরুষদের ঘড়ি",
    "Wooden Finish Alarm Table Clock" => "কাঠের ফিনিশ অ্যালার্ম টেবিল ঘড়ি",
    "Fashionable Casual Watch for Women" => "নারীদের জন্য ফ্যাশনেবল ক্যাজুয়াল ঘড়ি",
    "Premium Leather Strap Ladies Watch" => "প্রিমিয়াম লেদার স্ট্র্যাপ মহিলাদের ঘড়ি",
    "Compact Hair Dryer for Daily Use" => "দৈনন্দিন ব্যবহারের জন্য কমপ্যাক্ট হেয়ার ড্রায়ার",
    "Luxury Crystal Showpiece for Home Decor" => "হোম ডেকোরের জন্য লাক্সারি ক্রিস্টাল শোপিস",
    "Ocean Theme Resin Art Piece" => "মহাসমুদ্র থিম রেজিন আর্ট পিস",
    "Elegant Bracelet Watch for Women" => "নারীদের জন্য মার্জিত ব্রেসলেট ঘড়ি",
    "Premium Leather Strap Men’s Watch" => "প্রিমিয়াম লেদার স্ট্র্যাপ পুরুষদের ঘড়ি",
    "Mini Electric Food Chopper" => "মিনি ইলেকট্রিক ফুড চপার",
    "Rose Gold Luxury Women’s Watch" => "রোজ গোল্ড লাক্সারি মহিলাদের ঘড়ি",
    "Custom Resin Photo Frame" => "কাস্টম রেজিন ফটো ফ্রেম"
];

$products = DB::table('products')->get();
$count = 0;

foreach ($products as $p) {
    $updated = [];
    
    // Fix Colorful Crystal LED Candle Light where fields were reversed/mixed
    if (strpos($p->name, "Colorful Crystal LED Candle Light") !== false || strpos($p->name_en, "কালারফুল ক্রিস্টাল") !== false) {
        $updated['name_en'] = "Colorful Crystal LED Candle Light";
        $updated['name_bn'] = "কালারফুল ক্রিস্টাল এলইডি ক্যান্ডেল লাইট";
        $updated['name'] = "কালারফুল ক্রিস্টাল এলইডি ক্যান্ডেল লাইট";
        DB::table('products')->where('id', $p->id)->update($updated);
        $count++;
        continue;
    }
    
    // Clean name_en if it contains Bangla but English is expected
    if ($p->name_en && preg_match('/[\x{0980}-\x{09FF}]/u', $p->name_en)) {
        // name_en contains Bangla! Let's swap or correct it
        $updated['name_en'] = $p->name_bn;
        $updated['name_bn'] = $p->name_en;
        $p->name_en = $p->name_bn;
    }
    
    // Check if name_bn is identical to name_en and translate it
    if ($p->name_en && ($p->name_bn === $p->name_en || !$p->name_bn)) {
        $cleanEn = trim($p->name_en);
        if (isset($translations[$cleanEn])) {
            $updated['name_bn'] = $translations[$cleanEn];
            $updated['name'] = $translations[$cleanEn];
        }
    }
    
    if (!empty($updated)) {
        DB::table('products')->where('id', $p->id)->update($updated);
        $count++;
    }
}

echo "Successfully updated {$count} products!\n";
