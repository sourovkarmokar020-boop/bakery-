<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WhatsAppProductSeeder extends Seeder
{
    private const IMAGE_BASE = '/assets/uploads/product-images/whatsapp-20260709';

    public function run(): void
    {
        DB::transaction(function (): void {
            $now = now();
            $categories = [
                ['slug' => 'electronics-gadgets', 'en' => 'Electronics & Gadgets', 'bn' => 'ইলেকট্রনিক্স ও গ্যাজেটস', 'image' => 29, 'sort' => 1],
                ['slug' => 'home-decor-lighting', 'en' => 'Home Decor & Lighting', 'bn' => 'হোম ডেকর ও লাইটিং', 'image' => 41, 'sort' => 2],
                ['slug' => 'watches-clocks', 'en' => 'Watches & Clocks', 'bn' => 'ঘড়ি ও ক্লক', 'image' => 18, 'sort' => 3],
                ['slug' => 'kitchen-appliances', 'en' => 'Kitchen Appliances', 'bn' => 'কিচেন অ্যাপ্লায়েন্স', 'image' => 48, 'sort' => 4],
                ['slug' => 'travel-lifestyle', 'en' => 'Travel & Lifestyle', 'bn' => 'ট্রাভেল ও লাইফস্টাইল', 'image' => 49, 'sort' => 5],
                ['slug' => 'toys-kids', 'en' => 'Toys & Kids', 'bn' => 'টয়স ও কিডস', 'image' => 68, 'sort' => 6],
            ];

            $categoryIds = [];
            foreach ($categories as $category) {
                $existing = DB::table('categories')->where('slug', $category['slug'])->first();
                $id = $existing?->id ?? (string) Str::uuid();
                DB::table('categories')->updateOrInsert(
                    ['slug' => $category['slug']],
                    [
                        'id' => $id,
                        'name' => $category['bn'],
                        'name_en' => $category['en'],
                        'name_bn' => $category['bn'],
                        'image_url' => $this->image($category['image']),
                        'parent_id' => null,
                        'sort_order' => $category['sort'],
                        'is_active' => $existing?->is_active ?? true,
                        'show_in_navbar' => $existing?->show_in_navbar ?? true,
                        'show_on_home' => $existing?->show_on_home ?? true,
                        'created_at' => $existing?->created_at ?? $now,
                        'updated_at' => $now,
                    ]
                );
                $categoryIds[$category['slug']] = $id;
            }

            $brand = DB::table('brands')->where('name_en', 'Dream Mart')->orWhere('name', 'Dream Mart')->first();
            $brandId = $brand?->id ?? (string) Str::uuid();
            DB::table('brands')->updateOrInsert(
                ['id' => $brandId],
                [
                    'name' => 'Dream Mart',
                    'name_en' => 'Dream Mart',
                    'name_bn' => 'ড্রিম মার্ট',
                    'logo_url' => null,
                    'is_active' => true,
                    'created_at' => $brand?->created_at ?? $now,
                    'updated_at' => $now,
                ]
            );

            // Map every imported product to the category customers actually browse.
            // A broad source category such as "home-decor-lighting" is not enough:
            // lamps, clocks and gift items each have their own storefront category.
            $productCategorySlugs = [
                'rechargeable-laser-pointer-jd303' => 'gift-item',
                'love-couple-led-gift-lamp' => 'lamp',
                'best-friend-moon-led-gift-lamp' => 'lamp',
                'happy-every-day-moon-lamp' => 'lamp',
                'vintage-bicycle-candle-holder' => 'gift-item',
                'allah-muhammad-crystal-showpiece' => 'gift-item',
                'kaaba-dua-crystal-frame' => 'gift-item',
                'black-ship-crystal-showpiece' => 'gift-item',
                'decorative-crystal-perfume-bottle' => 'gift-item',
                'taj-mahal-crystal-showpiece' => 'gift-item',
                'liquid-sailing-boat-showpiece' => 'gift-item',
                'mens-premium-quartz-watch' => 'hand-watch',
                'cute-cartoon-twin-bell-alarm-clock' => 'alarm-clock',
                'classic-twin-bell-alarm-clock' => 'alarm-clock',
                'geometric-led-candle-light-set' => 'gift-item',
                'faceted-crystal-led-candle' => 'gift-item',
                'car-desk-lamp-pen-stand-sharpener' => 'lamp',
                'rechargeable-turbo-hand-fan' => 'gift-item',
                'ribbed-crystal-led-candle' => 'gift-item',
                'rabbit-flower-desk-lamp' => 'lamp',
                'cartoon-character-rechargeable-hand-fan' => 'gift-item',
                'cartoon-clock-desk-lamp' => 'lamp',
                'electric-grinder-950w' => 'crockeries',
                'smart-scalp-massager' => 'gift-item',
                'tulip-glass-dome-night-lamp' => 'lamp',
                'kids-balance-bike' => 'babys-toy',
                'electric-meat-grinder-1500w' => 'crockeries',
                'nima-2-in-1-electric-blender' => 'crockeries',
                'icy-pro-water-bottle' => 'water-bottle',
                'memory-foam-neck-pillow' => 'gift-item',
                'cute-lion-plush-toy' => 'babys-toy',
                'green-superhero-plush-toy' => 'babys-toy',
                'shield-hero-plush-toy' => 'babys-toy',
                'only-you-teddy-bear' => 'babys-toy',
                'pineapple-rabbit-plush-toy' => 'babys-toy',
                'bow-deer-plush-toy' => 'babys-toy',
                'lotus-crystal-led-candle' => 'gift-item',
                'iridescent-drip-led-candle' => 'gift-item',
                'dancing-cactus-musical-toy' => 'babys-toy',
                'automatic-bubble-gun' => 'babys-toy',
                'pixel-world-building-block-set' => 'babys-toy',
            ];
            $storefrontCategoryIds = DB::table('categories')
                ->whereIn('slug', array_values(array_unique($productCategorySlugs)))
                ->pluck('id', 'slug');

            $products = $this->products();
            $legacyProductSlugs = [
                'rechargeable-laser-pointer-jd303' => 'jd-303-rechargeable-green-laser-pointer-kit-1784449625642',
                'mens-premium-quartz-watch' => 'man-watch-1783600365902',
                'cute-cartoon-twin-bell-alarm-clock' => 'table-clock-1783600760738',
                'geometric-led-candle-light-set' => 'colorful-crystal-led-candle-light-1783601190464',
                'faceted-crystal-led-candle' => '-----1783601343786',
                'car-desk-lamp-pen-stand-sharpener' => 'cute-pink-cartoon-mini-desk-lamp-1783601497896',
                'rechargeable-turbo-hand-fan' => 'foldable-mini-hand-fan-with-digital-display-1783601730049',
                'cartoon-character-rechargeable-hand-fan' => 'disney-lotso-portable-mini-hand-fan-1200mah-1783602024776',
                'icy-pro-water-bottle' => 'icy-pro-stainless-steel-water-bottle-1783602526846',
                'memory-foam-neck-pillow' => 'soft-u-shaped-travel-neck-pillow-1783602718421',
            ];

            foreach ($products as $index => $product) {
                $imported = DB::table('products')->where('slug', $product['slug'])->first();
                $legacySlug = $legacyProductSlugs[$product['slug']] ?? null;
                $legacy = $legacySlug ? DB::table('products')->where('slug', $legacySlug)->first() : null;
                $existing = $legacy ?? $imported;
                $id = $existing?->id ?? (string) Str::uuid();
                $targetSlug = $legacy?->slug ?? $product['slug'];
                $imageUrls = array_map(fn (int $number): string => $this->image($number), $product['images']);
                $currentPrice = $product['price'];
                $oldPrice = $product['old'];

                if ($legacy && $imported && $legacy->id !== $imported->id) {
                    DB::table('products')
                        ->where('id', $imported->id)
                        ->where('sku', sprintf('FM-WA-%03d', $index + 1))
                        ->delete();
                }

                DB::table('products')->updateOrInsert(
                    ['id' => $id],
                    [
                        'slug' => $targetSlug,
                        'name' => $product['bn'],
                        'name_en' => $product['en'],
                        'name_bn' => $product['bn'],
                        'short_description' => $product['short_bn'],
                        'short_description_en' => $product['short_en'],
                        'short_description_bn' => $product['short_bn'],
                        'description' => $product['desc_bn'],
                        'description_en' => $product['desc_en'],
                        'description_bn' => $product['desc_bn'],
                        'base_price' => $oldPrice,
                        'sale_price' => $currentPrice,
                        'purchase_price' => round($currentPrice * 0.68),
                        'sku' => $legacy?->sku ?: sprintf('FM-WA-%03d', $index + 1),
                        'stock_quantity' => $product['stock'],
                        'category_id' => $storefrontCategoryIds[$productCategorySlugs[$product['slug']]],
                        'brand_id' => $brandId,
                        'image_url' => $imageUrls[0],
                        'images' => json_encode(array_slice($imageUrls, 1), JSON_UNESCAPED_SLASHES),
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

            // The second legacy watch row is the same watch in another converted image.
            // Keep its record for history, but hide it from storefront listings.
            DB::table('products')
                ->where('slug', 'man-watch-1783600536177')
                ->update(['is_active' => false, 'updated_at' => $now]);

            // These are import-source groupings, not customer-facing categories.
            DB::table('categories')
                ->whereIn('slug', [
                    'electronics-gadgets',
                    'home-decor-lighting',
                    'watches-clocks',
                    'kitchen-appliances',
                    'travel-lifestyle',
                    'toys-kids',
                    'electronic-item',
                    'travel-accessories',
                ])
                ->update([
                    'is_active' => false,
                    'show_in_navbar' => false,
                    'show_on_home' => false,
                    'updated_at' => $now,
                ]);
        });
    }

    private function image(int $number): string
    {
        return self::IMAGE_BASE.'/fm-20260709-u'.str_pad((string) $number, 2, '0', STR_PAD_LEFT).'.jpeg';
    }

    private function products(): array
    {
        return [
            $this->p('rechargeable-laser-pointer-jd303', 'JD-303 Rechargeable Laser Pointer Set', 'JD-303 রিচার্জেবল লেজার পয়েন্টার সেট', 'electronics-gadgets', 650, 790, [1, 2, 5], 18, true,
                'A compact rechargeable laser pointer set with battery, charger and presentation box.',
                'ব্যাটারি, চার্জার ও বক্সসহ কমপ্যাক্ট রিচার্জেবল লেজার পয়েন্টার সেট।',
                'Portable JD-303 style laser pointer supplied as a practical boxed set. Suitable for presentations and supervised recreational use; available colours may vary.',
                'পোর্টেবল JD-303 স্টাইলের লেজার পয়েন্টার একটি ব্যবহারযোগ্য বক্স সেট হিসেবে দেওয়া হবে। প্রেজেন্টেশন ও তত্ত্বাবধানে বিনোদনমূলক ব্যবহারের উপযোগী; রঙ ভিন্ন হতে পারে।'),

            $this->p('love-couple-led-gift-lamp', 'Love Couple LED Gift Lamp', 'লাভ কাপল এলইডি গিফট ল্যাম্প', 'home-decor-lighting', 450, 550, [3], 20, false,
                'A colourful couple-themed decorative LED lamp for gifting and room decor.',
                'উপহার ও রুম ডেকরের জন্য রঙিন কাপল-থিমের ডেকোরেটিভ এলইডি ল্যাম্প।',
                'The clear cylindrical body, cute couple scene and soft decorative lights create a warm gift-ready display for desks, shelves or bedside tables.',
                'স্বচ্ছ সিলিন্ডার বডি, কিউট কাপল দৃশ্য ও নরম ডেকোরেটিভ আলো ডেস্ক, শেলফ বা বেডসাইড টেবিলে সুন্দর গিফট ডিসপ্লে তৈরি করে।'),

            $this->p('best-friend-moon-led-gift-lamp', 'Best Friend Moon LED Gift Lamp', 'বেস্ট ফ্রেন্ড মুন এলইডি গিফট ল্যাম্প', 'home-decor-lighting', 450, 550, [4, 8], 16, true,
                'A moon-themed friendship lamp with colourful decorative lighting.',
                'রঙিন ডেকোরেটিভ আলোসহ মুন-থিমের ফ্রেন্ডশিপ ল্যাম্প।',
                'A charming best-friend gift featuring a moon character inside a clear display. It works beautifully as a small night accent or keepsake.',
                'স্বচ্ছ ডিসপ্লের ভেতরে মুন ক্যারেক্টারসহ আকর্ষণীয় বেস্ট-ফ্রেন্ড গিফট। ছোট নাইট অ্যাকসেন্ট বা স্মারক হিসেবে সুন্দর দেখায়।'),

            $this->p('happy-every-day-moon-lamp', 'Happy Every Day Moon Gift Lamp', 'হ্যাপি এভরি ডে মুন গিফট ল্যাম্প', 'home-decor-lighting', 450, 550, [6], 14, false,
                'A cute moon-character LED showpiece for desks, bedrooms and gifts.',
                'ডেস্ক, বেডরুম ও উপহারের জন্য কিউট মুন-ক্যারেক্টার এলইডি শোপিস।',
                'This compact decorative light combines a cheerful character, clear cover and colourful glow to brighten a personal corner without taking much space.',
                'কিউট ক্যারেক্টার, স্বচ্ছ কভার ও রঙিন আলো একসঙ্গে ছোট জায়গায় সুন্দর ব্যক্তিগত ডেকর তৈরি করে।'),

            $this->p('vintage-bicycle-candle-holder', 'Vintage Bicycle Candle Holder', 'ভিনটেজ বাইসাইকেল ক্যান্ডেল হোল্ডার', 'home-decor-lighting', 450, 550, [7], 12, false,
                'A metal bicycle-style candle holder and tabletop decor piece.',
                'মেটাল বাইসাইকেল-স্টাইল ক্যান্ডেল হোল্ডার ও টেবিল ডেকর।',
                'The miniature bicycle frame and rear holder add a vintage touch to living rooms, cafes, offices or gift arrangements. Candle is not included unless stated.',
                'মিনিয়েচার বাইসাইকেল ফ্রেম ও পেছনের হোল্ডার লিভিং রুম, ক্যাফে, অফিস বা গিফট সাজে ভিনটেজ লুক দেয়। আলাদাভাবে উল্লেখ না থাকলে ক্যান্ডেল অন্তর্ভুক্ত নয়।'),

            $this->p('allah-muhammad-crystal-showpiece', 'Allah & Muhammad Crystal Showpiece Set', 'আল্লাহ ও মুহাম্মদ ক্রিস্টাল শোপিস সেট', 'home-decor-lighting', 550, 690, [9, 10], 15, true,
                'A pair of elegant Islamic crystal-style tabletop showpieces.',
                'এলিগ্যান্ট ইসলামিক ক্রিস্টাল-স্টাইল টেবিল শোপিসের জোড়া।',
                'Designed for respectful home or office display, the set features Allah and Muhammad calligraphy in a compact crystal-look presentation.',
                'সম্মানজনক ঘর বা অফিস ডেকরের জন্য তৈরি সেটটিতে কমপ্যাক্ট ক্রিস্টাল-লুক ডিজাইনে আল্লাহ ও মুহাম্মদ ক্যালিগ্রাফি রয়েছে।'),

            $this->p('kaaba-dua-crystal-frame', 'Kaaba Dua Crystal Table Frame', 'কাবা দোয়া ক্রিস্টাল টেবিল ফ্রেম', 'home-decor-lighting', 850, 990, [11], 10, true,
                'A premium Kaaba-themed dua frame with a gold-tone crystal look.',
                'গোল্ড-টোন ক্রিস্টাল লুকের প্রিমিয়াম কাবা-থিম দোয়া ফ্রেম।',
                'An eye-catching Islamic tabletop frame featuring a Kaaba scene and selected dua text. Ideal for home, office or meaningful gifting.',
                'কাবার দৃশ্য ও নির্বাচিত দোয়ার লেখা সমৃদ্ধ আকর্ষণীয় ইসলামিক টেবিল ফ্রেম। ঘর, অফিস বা অর্থবহ উপহারের জন্য উপযোগী।'),

            $this->p('black-ship-crystal-showpiece', 'Black Ship Crystal Display Showpiece', 'ব্ল্যাক শিপ ক্রিস্টাল ডিসপ্লে শোপিস', 'home-decor-lighting', 650, 790, [12], 9, false,
                'A miniature black ship presented inside a clear display case.',
                'স্বচ্ছ ডিসপ্লে কেসের ভেতরে মিনিয়েচার ব্ল্যাক শিপ শোপিস।',
                'The nautical miniature and clean transparent case make a distinctive desk or shelf accent while helping protect the inner display from dust.',
                'নটিক্যাল মিনিয়েচার ও স্বচ্ছ কেস ডেস্ক বা শেলফে ইউনিক লুক দেয় এবং ভেতরের ডিসপ্লেকে ধুলা থেকে রক্ষা করতে সাহায্য করে।'),

            $this->p('decorative-crystal-perfume-bottle', 'Decorative Crystal Bottle Showpiece', 'ডেকোরেটিভ ক্রিস্টাল বোতল শোপিস', 'home-decor-lighting', 450, 550, [13], 12, false,
                'A compact crystal-look decorative bottle with colourful inner detail.',
                'রঙিন ভেতরের ডিটেইলসহ কমপ্যাক্ট ক্রিস্টাল-লুক ডেকোরেটিভ বোতল।',
                'A sparkling small accent piece suited to dressing tables, showcases, shelves and gift arrangements. This listing is for decorative use.',
                'ড্রেসিং টেবিল, শোকেস, শেলফ ও গিফট সাজের জন্য ঝকঝকে ছোট অ্যাকসেন্ট পিস। এটি ডেকোরেটিভ ব্যবহারের পণ্য।'),

            $this->p('taj-mahal-crystal-showpiece', 'Taj Mahal Crystal Showpiece', 'তাজমহল ক্রিস্টাল শোপিস', 'home-decor-lighting', 650, 790, [14], 11, false,
                'A gold-tone Taj Mahal miniature on a clear decorative base.',
                'স্বচ্ছ ডেকোরেটিভ বেসে গোল্ড-টোন তাজমহল মিনিয়েচার।',
                'This detailed architectural miniature brings a classic souvenir look to desks, shelves and showcases and makes a memorable gift.',
                'ডিটেইলড আর্কিটেকচারাল মিনিয়েচারটি ডেস্ক, শেলফ ও শোকেসে ক্লাসিক সুভেনির লুক দেয় এবং স্মরণীয় উপহার হতে পারে।'),

            $this->p('liquid-sailing-boat-showpiece', 'Liquid Sailing Boat Crystal Showpiece', 'লিকুইড সেলিং বোট ক্রিস্টাল শোপিস', 'home-decor-lighting', 450, 550, [15, 16, 17, 20], 22, true,
                'A colourful liquid-filled sailing boat ornament in assorted designs.',
                'বিভিন্ন ডিজাইনের রঙিন লিকুইড-ফিল্ড সেলিং বোট অর্নামেন্ট।',
                'The transparent sailboat design, floating decorative elements and vivid colours create a playful nautical accent. Colour and inner figure may vary.',
                'স্বচ্ছ সেলবোট ডিজাইন, ভাসমান ডেকোরেটিভ উপাদান ও উজ্জ্বল রঙ নটিক্যাল ডেকরকে আকর্ষণীয় করে। রঙ ও ভেতরের ফিগার ভিন্ন হতে পারে।'),

            $this->p('mens-premium-quartz-watch', "Men's Premium Quartz Wrist Watch", 'মেনস প্রিমিয়াম কোয়ার্টজ রিস্ট ওয়াচ', 'watches-clocks', 950, 1150, [18, 19, 23], 12, true,
                'A refined metal-strap quartz watch in assorted dial designs.',
                'বিভিন্ন ডায়াল ডিজাইনের রিফাইন্ড মেটাল-স্ট্র্যাপ কোয়ার্টজ ঘড়ি।',
                'A versatile everyday wrist watch with a polished metal look and easy-to-read analogue dial. Dial design may vary according to available stock.',
                'পলিশড মেটাল লুক ও সহজে পড়া যায় এমন অ্যানালগ ডায়ালসহ দৈনন্দিন ব্যবহারের ঘড়ি। স্টক অনুযায়ী ডায়াল ডিজাইন ভিন্ন হতে পারে।'),

            $this->p('cute-cartoon-twin-bell-alarm-clock', 'Cute Cartoon Twin Bell Alarm Clock', 'কিউট কার্টুন টুইন বেল অ্যালার্ম ক্লক', 'watches-clocks', 450, 550, [21, 22], 18, false,
                'A compact twin-bell alarm clock with cute illustrated dials.',
                'কিউট ইলাস্ট্রেটেড ডায়ালসহ কমপ্যাক্ট টুইন-বেল অ্যালার্ম ক্লক।',
                'The classic bell shape, playful dial artwork and compact footprint make it suitable for kids rooms, study tables and bedside use.',
                'ক্লাসিক বেল শেপ, মজার ডায়াল আর্টওয়ার্ক ও কমপ্যাক্ট সাইজ শিশুদের রুম, স্টাডি টেবিল ও বেডসাইড ব্যবহারের উপযোগী।'),

            $this->p('classic-twin-bell-alarm-clock', 'Classic Twin Bell Alarm Clock', 'ক্লাসিক টুইন বেল অ্যালার্ম ক্লক', 'watches-clocks', 550, 650, [24, 26], 14, false,
                'A vintage-inspired metal twin-bell alarm clock with bold numerals.',
                'বোল্ড নম্বরসহ ভিনটেজ-স্টাইল মেটাল টুইন-বেল অ্যালার্ম ক্লক।',
                'A practical bedside clock combining a traditional twin-bell silhouette, stable feet and a clear analogue face for quick time reading.',
                'ট্র্যাডিশনাল টুইন-বেল শেপ, স্থির পা ও পরিষ্কার অ্যানালগ ডায়ালসহ ব্যবহারযোগ্য বেডসাইড ক্লক।'),

            $this->p('geometric-led-candle-light-set', 'Geometric Colour LED Candle Light Set', 'জিওমেট্রিক কালার এলইডি ক্যান্ডেল লাইট সেট', 'home-decor-lighting', 650, 790, [25, 28, 59, 61], 20, true,
                'Flameless geometric LED candles with a colourful reflective glow.',
                'রঙিন রিফ্লেক্টিভ গ্লোসহ ফ্লেমলেস জিওমেট্রিক এলইডি ক্যান্ডেল।',
                'These decorative battery-style lights create a candle ambience without an open flame. Multiple sizes and decorative arrangements are shown.',
                'খোলা আগুন ছাড়াই ক্যান্ডেলের আবহ তৈরি করে এই ডেকোরেটিভ লাইট। ছবিতে বিভিন্ন সাইজ ও সাজানোর ধরন দেখানো হয়েছে।'),

            $this->p('faceted-crystal-led-candle', 'Faceted Crystal LED Candle', 'ফ্যাসেটেড ক্রিস্টাল এলইডি ক্যান্ডেল', 'home-decor-lighting', 350, 450, [27], 24, false,
                'A compact faceted crystal-look flameless candle light.',
                'কমপ্যাক্ট ফ্যাসেটেড ক্রিস্টাল-লুক ফ্লেমলেস ক্যান্ডেল লাইট।',
                'The textured transparent body spreads a warm glow and works well for table settings, shelves, festive decor and safe indoor ambience.',
                'টেক্সচারড স্বচ্ছ বডি উষ্ণ আলো ছড়ায় এবং টেবিল সেটিং, শেলফ, উৎসবের সাজ ও নিরাপদ ইনডোর অ্যাম্বিয়েন্সে মানানসই।'),

            $this->p('car-desk-lamp-pen-stand-sharpener', '3-in-1 Car Desk Lamp, Pen Stand & Sharpener', '৩-ইন-১ কার ডেস্ক ল্যাম্প, পেন স্ট্যান্ড ও শার্পনার', 'electronics-gadgets', 750, 890, [29, 42, 46], 18, true,
                'A playful car-shaped desk lamp with pen holder and pencil sharpener.',
                'পেন হোল্ডার ও পেন্সিল শার্পনারসহ মজার কার-শেপ ডেস্ক ল্যাম্প।',
                'The flexible lamp neck, stationery storage and built-in sharpening function make this a fun, space-saving study-table companion. Colours may vary.',
                'ফ্লেক্সিবল ল্যাম্প নেক, স্টেশনারি স্টোরেজ ও বিল্ট-ইন শার্পনার এটিকে মজার ও স্পেস-সেভিং স্টাডি টেবিল সঙ্গী করে। রঙ ভিন্ন হতে পারে।'),

            $this->p('rechargeable-turbo-hand-fan', 'Rechargeable Foldable Turbo Hand Fan', 'রিচার্জেবল ফোল্ডেবল টার্বো হ্যান্ড ফ্যান', 'electronics-gadgets', 850, 990, [30, 39], 20, true,
                'A portable foldable turbo fan with adjustable handheld or desk use.',
                'হ্যান্ডহেল্ড বা ডেস্ক ব্যবহারের জন্য পোর্টেবল ফোল্ডেবল টার্বো ফ্যান।',
                'Its folding body and compact circular head make it easy to carry and position. A practical personal-cooling option for travel, office and home.',
                'ফোল্ডিং বডি ও কমপ্যাক্ট গোল হেড সহজে বহন ও পজিশন করা যায়। ভ্রমণ, অফিস ও ঘরে ব্যক্তিগত শীতলতার ব্যবহারযোগ্য সমাধান।'),

            $this->p('ribbed-crystal-led-candle', 'Ribbed Crystal LED Candle Light', 'রিবড ক্রিস্টাল এলইডি ক্যান্ডেল লাইট', 'home-decor-lighting', 450, 550, [31, 62], 18, false,
                'A ribbed crystal-look flameless candle that casts patterned light.',
                'প্যাটার্ন আলো ছড়ানো রিবড ক্রিস্টাল-লুক ফ্লেমলেস ক্যান্ডেল।',
                'The vertical ribbed body produces attractive light patterns around the candle, creating an elegant table or bedside atmosphere.',
                'ভার্টিক্যাল রিবড বডি ক্যান্ডেলের চারপাশে সুন্দর আলোর প্যাটার্ন তৈরি করে, ফলে টেবিল বা বেডসাইডে এলিগ্যান্ট পরিবেশ হয়।'),

            $this->p('rabbit-flower-desk-lamp', 'Rabbit Flower Desk Lamp with Pen Holder', 'পেন হোল্ডারসহ র‍্যাবিট ফ্লাওয়ার ডেস্ক ল্যাম্প', 'electronics-gadgets', 750, 890, [32, 35, 67], 20, true,
                'A flower-head study lamp with rabbit night light and pen holder.',
                'র‍্যাবিট নাইট লাইট ও পেন হোল্ডারসহ ফ্লাওয়ার-হেড স্টাডি ল্যাম্প।',
                'This colourful multifunction desk accessory combines focused study lighting, a glowing cartoon figure and convenient stationery storage.',
                'রঙিন মাল্টিফাংশন ডেস্ক অ্যাকসেসরিটিতে ফোকাসড স্টাডি লাইট, গ্লো করা কার্টুন ফিগার ও সুবিধাজনক স্টেশনারি স্টোরেজ রয়েছে।'),

            $this->p('cartoon-character-rechargeable-hand-fan', 'Cartoon Character Rechargeable Hand Fan', 'কার্টুন ক্যারেক্টার রিচার্জেবল হ্যান্ড ফ্যান', 'electronics-gadgets', 750, 890, [33, 34, 37], 22, false,
                'A rechargeable 1200mAh-style hand fan with light and assorted characters.',
                'লাইট ও বিভিন্ন ক্যারেক্টারসহ ১২০০mAh-স্টাইল রিচার্জেবল হ্যান্ড ফ্যান।',
                'The portable fan combines personal cooling with a small front light. Character and colour are supplied from available Lotso, bear or Minnie-style designs.',
                'পোর্টেবল ফ্যানটি ব্যক্তিগত বাতাসের সঙ্গে সামনে ছোট লাইট দেয়। স্টক অনুযায়ী লটসো, বেয়ার বা মিনি-স্টাইল ডিজাইন দেওয়া হবে।'),

            $this->p('cartoon-clock-desk-lamp', 'Cartoon Clock LED Desk Lamp', 'কার্টুন ক্লক এলইডি ডেস্ক ল্যাম্প', 'watches-clocks', 850, 990, [36, 44, 64], 16, true,
                'A cheerful cartoon clock combined with a flexible LED study lamp.',
                'ফ্লেক্সিবল এলইডি স্টাডি ল্যাম্পসহ কিউট কার্টুন ক্লক।',
                'This two-in-one desk accessory keeps time visible while providing a directed reading light. Multiple colours are shown and supplied subject to stock.',
                'টু-ইন-ওয়ান ডেস্ক অ্যাকসেসরিটি সময় দেখানোর পাশাপাশি পড়ার জন্য নির্দেশিত আলো দেয়। ছবিতে একাধিক রঙ দেখানো হয়েছে, স্টক অনুযায়ী সরবরাহ হবে।'),

            $this->p('electric-grinder-950w', 'Electric Grinder 950W', 'ইলেকট্রিক গ্রাইন্ডার ৯৫০W', 'kitchen-appliances', 1050, 1190, [38], 10, true,
                'A compact 950W-style electric grinder for dry kitchen ingredients.',
                'শুকনা রান্নার উপকরণের জন্য কমপ্যাক্ট ৯৫০W-স্টাইল ইলেকট্রিক গ্রাইন্ডার।',
                'Designed for convenient small-batch grinding, the unit includes a compact jar and simple push-button operation. Follow the supplied instructions and avoid overfilling.',
                'অল্প পরিমাণ উপকরণ সহজে গ্রাইন্ড করার জন্য কমপ্যাক্ট জার ও সহজ পুশ-বাটন অপারেশন রয়েছে। নির্দেশনা মেনে ব্যবহার করুন এবং অতিরিক্ত ভরবেন না।'),

            $this->p('smart-scalp-massager', 'Smart Scalp Massager', 'স্মার্ট স্ক্যাল্প ম্যাসাজার', 'electronics-gadgets', 650, 790, [40], 14, false,
                'A compact electric scalp massager for relaxing head massage.',
                'রিল্যাক্সিং হেড ম্যাসাজের জন্য কমপ্যাক্ট ইলেকট্রিক স্ক্যাল্প ম্যাসাজার।',
                'The ergonomic handheld body is designed for gentle scalp massage at home. Use on a comfortable setting and keep the device dry unless its manual states otherwise.',
                'এর্গোনমিক হ্যান্ডহেল্ড বডি ঘরে আরামদায়ক স্ক্যাল্প ম্যাসাজের জন্য তৈরি। আরামদায়ক সেটিংয়ে ব্যবহার করুন এবং ম্যানুয়ালে ভিন্ন নির্দেশ না থাকলে শুকনা রাখুন।'),

            $this->p('tulip-glass-dome-night-lamp', 'Tulip Glass Dome Night Lamp', 'টিউলিপ গ্লাস ডোম নাইট ল্যাম্প', 'home-decor-lighting', 750, 890, [41], 15, true,
                'A warm illuminated tulip arrangement inside a clear glass-style dome.',
                'স্বচ্ছ গ্লাস-স্টাইল ডোমের ভেতরে উষ্ণ আলোয় টিউলিপ ফুলের সাজ।',
                'A romantic decorative light for bedside tables, desks and gifting. The enclosed floral scene creates a soft ambience and an elegant display.',
                'বেডসাইড টেবিল, ডেস্ক ও উপহারের জন্য রোমান্টিক ডেকোরেটিভ লাইট। আবদ্ধ ফুলের দৃশ্য নরম পরিবেশ ও এলিগ্যান্ট ডিসপ্লে তৈরি করে।'),

            $this->p('kids-balance-bike', "Kids' Balance Bike with Training Wheels", 'ট্রেনিং হুইলসহ কিডস ব্যালেন্স বাইক', 'toys-kids', 1200, 1390, [43], 8, true,
                'A child-friendly beginner bike with pedals and removable-style support wheels.',
                'পেডাল ও সাপোর্ট হুইলসহ শিশুদের উপযোগী বিগিনার বাইক।',
                'The low seat, broad wheels and rear support wheels are designed to help young riders practise balance under adult supervision. Colour may vary.',
                'লো সিট, চওড়া চাকা ও পেছনের সাপোর্ট হুইল ছোট শিশুদের প্রাপ্তবয়স্কের তত্ত্বাবধানে ব্যালেন্স অনুশীলনে সাহায্য করে। রঙ ভিন্ন হতে পারে।'),

            $this->p('electric-meat-grinder-1500w', 'Electric Meat Grinder 1500W', 'ইলেকট্রিক মিট গ্রাইন্ডার ১৫০০W', 'kitchen-appliances', 920, 1090, [45], 10, false,
                'A compact 1500W-style electric grinder with stainless-look bowl.',
                'স্টেইনলেস-লুক বোলসহ কমপ্যাক্ট ১৫০০W-স্টাইল ইলেকট্রিক গ্রাইন্ডার।',
                'Suitable for convenient kitchen preparation in small batches. Place on a stable surface, secure the lid and operate in short intervals as directed.',
                'অল্প পরিমাণ রান্নার প্রস্তুতির জন্য সুবিধাজনক। সমতল জায়গায় রাখুন, ঢাকনা ঠিকভাবে লাগান এবং নির্দেশনা অনুযায়ী অল্প সময় করে চালান।'),

            $this->p('nima-2-in-1-electric-blender', 'Nima NM-8300 2-in-1 Electric Blender', 'নিমা NM-8300 ২-ইন-১ ইলেকট্রিক ব্লেন্ডার', 'kitchen-appliances', 1200, 1390, [47, 48], 10, true,
                'A compact Nima-style blender and grinder for coffee, spices and juice preparation.',
                'কফি, মসলা ও জুস প্রস্তুতির জন্য কমপ্যাক্ট নিমা-স্টাইল ব্লেন্ডার ও গ্রাইন্ডার।',
                'The 2-in-1 countertop design combines a clear blending jar, stainless-look base and straightforward one-button control for everyday small-batch use.',
                '২-ইন-১ কাউন্টারটপ ডিজাইনে স্বচ্ছ ব্লেন্ডিং জার, স্টেইনলেস-লুক বেস ও সহজ এক-বাটন কন্ট্রোল রয়েছে, যা দৈনন্দিন অল্প পরিমাণ ব্যবহারে উপযোগী।'),

            $this->p('icy-pro-water-bottle', 'ICY Pro Portable Water Bottle', 'আইসি প্রো পোর্টেবল ওয়াটার বোতল', 'travel-lifestyle', 450, 550, [49, 50, 51], 30, true,
                'A slim portable water bottle with screw cap and carry strap.',
                'স্ক্রু ক্যাপ ও ক্যারি স্ট্র্যাপসহ স্লিম পোর্টেবল ওয়াটার বোতল।',
                'The narrow profile fits easily in backpacks and everyday carry setups. Available in assorted colours; wash before first use.',
                'স্লিম ডিজাইন ব্যাকপ্যাক ও দৈনন্দিন বহনে সহজে মানিয়ে যায়। বিভিন্ন রঙে পাওয়া যায়; প্রথম ব্যবহারের আগে ধুয়ে নিন।'),

            $this->p('memory-foam-neck-pillow', 'Soft Travel Neck Pillow', 'সফট ট্রাভেল নেক পিলো', 'travel-lifestyle', 550, 650, [52], 18, false,
                'A soft U-shaped neck pillow for travel, rest and desk breaks.',
                'ভ্রমণ, বিশ্রাম ও ডেস্ক ব্রেকের জন্য সফট U-শেপ নেক পিলো।',
                'The supportive wraparound shape helps provide comfortable neck positioning during flights, bus rides, reading or relaxed seating.',
                'সাপোর্টিভ র‍্যাপঅ্যারাউন্ড শেপ ফ্লাইট, বাস ভ্রমণ, পড়া বা বসে বিশ্রামের সময় ঘাড়কে আরামদায়ক অবস্থানে রাখতে সাহায্য করে।'),

            $this->p('cute-lion-plush-toy', 'Cute Lion Plush Toy', 'কিউট লায়ন প্লাশ টয়', 'toys-kids', 650, 790, [53], 14, true,
                'A cuddly lion plush with a bright mane and friendly face.',
                'উজ্জ্বল কেশর ও হাসিমুখসহ আদুরে লায়ন প্লাশ টয়।',
                'Soft-looking fabric and a cheerful character design make this plush suitable for room decor, gifting and supervised play.',
                'সফট-লুক ফ্যাব্রিক ও হাসিখুশি ক্যারেক্টার ডিজাইন রুম ডেকর, উপহার ও তত্ত্বাবধানে খেলার জন্য উপযোগী।'),

            $this->p('green-superhero-plush-toy', 'Green Superhero Plush Toy', 'গ্রিন সুপারহিরো প্লাশ টয়', 'toys-kids', 750, 890, [54], 12, false,
                'A large green muscular superhero-inspired soft toy.',
                'বড় আকারের গ্রিন মাসকুলার সুপারহিরো-স্টাইল সফট টয়।',
                'The bold green character, embroidered details and soft construction make an exciting gift for superhero fans and themed rooms.',
                'বোল্ড সবুজ ক্যারেক্টার, এমব্রয়ডারি ডিটেইল ও সফট নির্মাণ সুপারহিরো ভক্ত ও থিমড রুমের জন্য আকর্ষণীয় উপহার।'),

            $this->p('shield-hero-plush-toy', 'Shield Hero Plush Toy', 'শিল্ড হিরো প্লাশ টয়', 'toys-kids', 750, 890, [55], 12, false,
                'A blue-and-red shield hero-inspired plush character.',
                'নীল-লাল শিল্ড হিরো-স্টাইল প্লাশ ক্যারেক্টার।',
                'Designed with a colourful suit and soft shield detail, this character plush is suited to gifting, collecting and decorative display.',
                'রঙিন স্যুট ও সফট শিল্ড ডিটেইলসহ ক্যারেক্টার প্লাশটি উপহার, সংগ্রহ ও ডেকোরেটিভ ডিসপ্লের জন্য উপযোগী।'),

            $this->p('only-you-teddy-bear', 'Only You Teddy Bear', 'অনলি ইউ টেডি বেয়ার', 'toys-kids', 550, 650, [56], 20, false,
                'A sweet teddy bear with colourful Only You clothing.',
                'রঙিন অনলি ইউ পোশাকসহ মিষ্টি টেডি বেয়ার।',
                'A soft-looking classic teddy available in assorted clothing colours, ideal for birthdays, friendship gifts and room decoration.',
                'বিভিন্ন রঙের পোশাকে পাওয়া যায় এমন সফট-লুক ক্লাসিক টেডি, জন্মদিন, বন্ধুত্বের উপহার ও রুম ডেকরের জন্য মানানসই।'),

            $this->p('pineapple-rabbit-plush-toy', 'Pineapple Rabbit Plush Toy', 'পাইনঅ্যাপল র‍্যাবিট প্লাশ টয়', 'toys-kids', 650, 790, [57], 16, false,
                'A cheerful rabbit plush holding a pineapple-shaped detail.',
                'পাইনঅ্যাপল ডিটেইল হাতে হাসিখুশি র‍্যাবিট প্লাশ টয়।',
                'The bright yellow outfit, long ears and friendly embroidered face create a cute gift and nursery or bedroom accent.',
                'উজ্জ্বল হলুদ পোশাক, লম্বা কান ও সুন্দর এমব্রয়ডারি মুখ এটিকে কিউট উপহার এবং নার্সারি বা বেডরুম ডেকর করে।'),

            $this->p('bow-deer-plush-toy', 'Bow Deer Plush Toy', 'বো ডিয়ার প্লাশ টয়', 'toys-kids', 750, 890, [58], 14, true,
                'A long-legged deer plush with a large decorative bow.',
                'বড় ডেকোরেটিভ বোসহ লম্বা পায়ের ডিয়ার প্লাশ টয়।',
                'Pastel colours, heart details and a statement bow give this deer plush a charming gift-ready appearance. Colour may vary.',
                'প্যাস্টেল রঙ, হার্ট ডিটেইল ও বড় বো ডিয়ার প্লাশটিকে আকর্ষণীয় গিফট-রেডি লুক দেয়। রঙ ভিন্ন হতে পারে।'),

            $this->p('lotus-crystal-led-candle', 'Lotus Crystal LED Candle Light', 'লোটাস ক্রিস্টাল এলইডি ক্যান্ডেল লাইট', 'home-decor-lighting', 450, 550, [60, 65], 22, false,
                'A lotus-shaped crystal-look flameless candle with warm LED glow.',
                'উষ্ণ এলইডি আলোসহ লোটাস-শেপ ক্রিস্টাল-লুক ফ্লেমলেস ক্যান্ডেল।',
                'The petal-shaped transparent body surrounds a warm faux flame, making it a safe decorative accent for tables, prayer corners and events.',
                'পাপড়ি-শেপ স্বচ্ছ বডির মাঝে উষ্ণ কৃত্রিম শিখা টেবিল, প্রার্থনার কর্নার ও অনুষ্ঠানে নিরাপদ ডেকোরেটিভ অ্যাকসেন্ট তৈরি করে।'),

            $this->p('iridescent-drip-led-candle', 'Iridescent Drip LED Candle', 'ইরিডেসেন্ট ড্রিপ এলইডি ক্যান্ডেল', 'home-decor-lighting', 450, 550, [63], 18, false,
                'A rainbow iridescent flameless candle with decorative drip edging.',
                'ডেকোরেটিভ ড্রিপ এজিংসহ রেইনবো ইরিডেসেন্ট ফ্লেমলেস ক্যান্ডেল।',
                'Its reflective colour-shifting body and faux melting-wax detail create a modern candle look for shelves, tables and cosy corners.',
                'রিফ্লেক্টিভ কালার-শিফটিং বডি ও কৃত্রিম গলিত মোমের ডিটেইল শেলফ, টেবিল ও আরামদায়ক কর্নারে আধুনিক ক্যান্ডেল লুক দেয়।'),

            $this->p('dancing-cactus-musical-toy', 'Dancing Cactus Musical Toy', 'ড্যান্সিং ক্যাকটাস মিউজিক্যাল টয়', 'toys-kids', 650, 790, [66], 18, true,
                'An interactive dancing cactus toy with music and repeating-style fun.',
                'মিউজিক ও রিপিটিং-স্টাইল মজাসহ ইন্টারঅ্যাকটিভ ড্যান্সিং ক্যাকটাস টয়।',
                'The animated cactus sways and entertains with sound, making it a lively novelty gift for children and family moments. Adult setup is recommended.',
                'অ্যানিমেটেড ক্যাকটাস নড়াচড়া ও শব্দ দিয়ে আনন্দ দেয়, শিশু ও পারিবারিক মুহূর্তে মজার উপহার। প্রাপ্তবয়স্কের সহায়তায় সেটআপ করা ভালো।'),

            $this->p('automatic-bubble-gun', 'Automatic Bubble Gun', 'অটোমেটিক বাবল গান', 'toys-kids', 550, 650, [68], 24, true,
                'A colourful automatic bubble blaster for outdoor play and parties.',
                'আউটডোর খেলা ও পার্টির জন্য রঙিন অটোমেটিক বাবল ব্লাস্টার।',
                'Designed to produce multiple bubbles quickly for birthdays, picnics and garden play. Use the included or suitable bubble solution under adult supervision.',
                'জন্মদিন, পিকনিক ও বাগানে খেলায় দ্রুত অনেক বাবল তৈরির জন্য ডিজাইন করা। প্রাপ্তবয়স্কের তত্ত্বাবধানে উপযুক্ত বাবল সলিউশন ব্যবহার করুন।'),

            $this->p('pixel-world-building-block-set', 'Pixel World 971-Piece Building Block Set', 'পিক্সেল ওয়ার্ল্ড ৯৭১-পিস বিল্ডিং ব্লক সেট', 'toys-kids', 1200, 1390, [69], 8, true,
                'A large 971-piece pixel-world building set for ages 6 and above.',
                '৬ বছর ও তদূর্ধ্বদের জন্য বড় ৯৭১-পিস পিক্সেল-ওয়ার্ল্ড বিল্ডিং সেট।',
                'The detailed construction set includes colourful blocks for building a fantasy cave scene and characters. Contains small parts; adult supervision is recommended.',
                'ডিটেইলড কনস্ট্রাকশন সেটে ফ্যান্টাসি কেভ দৃশ্য ও ক্যারেক্টার তৈরির রঙিন ব্লক রয়েছে। ছোট অংশ থাকায় প্রাপ্তবয়স্কের তত্ত্বাবধান প্রয়োজন।'),
        ];
    }

    private function p(
        string $slug,
        string $en,
        string $bn,
        string $category,
        int $price,
        int $old,
        array $images,
        int $stock,
        bool $featured,
        string $shortEn,
        string $shortBn,
        string $descEn,
        string $descBn,
    ): array {
        return [
            'slug' => $slug,
            'en' => $en,
            'bn' => $bn,
            'category' => $category,
            'price' => $price,
            'old' => $old,
            'images' => $images,
            'stock' => $stock,
            'featured' => $featured,
            'short_en' => $shortEn,
            'short_bn' => $shortBn,
            'desc_en' => $descEn,
            'desc_bn' => $descBn,
        ];
    }
}
