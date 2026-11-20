<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DreamMartSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['Pending', '#f59e0b', 1],
            ['Processing', '#3b82f6', 2],
            ['On The Way', '#8b5cf6', 3],
            ['On Hold', '#ef4444', 4],
            ['In Courier', '#06b6d4', 5],
            ['Completed', '#10b981', 6],
            ['Cancelled', '#6b7280', 7],
        ] as [$name, $color, $sort]) {
            DB::table('order_statuses')->updateOrInsert(
                ['name' => $name],
                ['id' => (string) Str::uuid(), 'color' => $color, 'sort_order' => $sort, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        foreach ([
            ['site_name', 'Dream Mart', 'general'],
            ['site_logo', '', 'general'],
            ['site_phone', '01985403218', 'general'],
            ['site_email', '', 'general'],
            ['site_address', '', 'general'],
            ['facebook_pixel', '', 'pixels'],
            ['google_tag_manager', '', 'pixels'],

            // ব্র্যান্ডিং
            ['brand_name', 'Dream Mart', 'branding'],
            ['brand_color', '#1d8644', 'branding'],
            ['button_color', '#036CC7', 'branding'],
            ['brand_name_size', '24', 'branding'],
            ['logo_size', '40', 'branding'],
            ['brand_logo', '', 'branding'],
            ['favicon_url', '', 'branding'],
            ['brand_display_mode', 'name_only', 'branding'],
            ['accent_color', '#f59e0b', 'branding'],
            ['gradient_mode', 'solid', 'branding'],

            // যোগাযোগ তথ্য
            ['whatsapp_number', '01985403218', 'contact'],
            ['whatsapp_template', '', 'contact'],
            ['business_hours', 'প্রতিদিন সকাল ৯টা - রাত ১০টা', 'contact'],

            // ফুটার সেটিংস
            ['footer_cta_title', '১০০+ কোম্পানি আমাদের বিশ্বাস করে', 'footer'],
            ['footer_cta_subtitle', 'কর্পোরেট ডিল, কাস্টম প্রাইসিং এবং নির্ভরযোগ্য ডেলিভারি', 'footer'],
            ['footer_cta_phone', '01985403218', 'footer'],
            ['footer_blurb', 'ড্রিম মার্ট নিয়ে এসেছে ক্রোকারিজ, ব্যাগ, ঘড়ি, ল্যাম্প, খেলনা ও গিফট আইটেম — অরিজিনাল পণ্য সারাদেশে আপনার দোরগোড়ায় পৌঁছে দিই।', 'footer'],
            ['footer_blurb_bn', 'ড্রিম মার্ট নিয়ে এসেছে ক্রোকারিজ, ব্যাগ, ঘড়ি, ল্যাম্প, খেলনা ও গিফট আইটেম — অরিজিনাল পণ্য সারাদেশে আপনার দোরগোড়ায় পৌঁছে দিই।', 'footer'],
            ['footer_blurb_en', 'Dream Mart brings you crockery, bags, watches, lamps, toys and gift items — original products delivered to your doorstep across the country.', 'footer'],
            // ফুটারের লোগোর নিচে দেখানো ঠিকানা ও ফোন (সাইটের অন্য জায়গার site_phone
            // থেকে আলাদা — অ্যাডমিন প্যানেল → সেটিংস → ফুটার সেটিংস থেকে বদলানো যায়)
            ['footer_address', 'Address-House-26,Road-2,Adabor,Dhaka-1207.', 'footer'],
            ['footer_phone', '01680310063', 'footer'],
            ['social_facebook', '', 'footer'],
            ['social_instagram', '', 'footer'],
            ['social_youtube', '', 'footer'],
            ['footer_category_links', '[{"label":"সুপার ফুডস","url":"/category/super-foods"},{"label":"অর্গানিক মধু","url":"/category/organic-honey"},{"label":"মিষ্টি ও দুগ্ধ","url":"/category/sweeteners-dairy"},{"label":"অর্গানিক মশলা","url":"/category/organic-spices"}]', 'footer'],
            ['footer_important_links', '[{"label":"অর্ডার ট্র্যাক","url":"/track-order"},{"label":"লগইন","url":"/login"},{"label":"কার্ট","url":"/cart"}]', 'footer'],
            ['copyright_text', '© 2026 Dream Mart. All rights reserved.', 'footer'],

            // হোমপেজ সেকশন দৃশ্যমানতা
            ['show_category_section', 'true', 'homepage'],
            ['show_trending_section', 'true', 'homepage'],
            ['show_offer_section', 'true', 'homepage'],
            ['show_flashsale_section', 'true', 'homepage'],

            // SEO / মেটা তথ্য
            ['seo_title', 'Dream Mart', 'seo'],
            ['seo_description', 'Dream Mart - Your favourite online shop', 'seo'],
            ['seo_og_image', '', 'seo'],
        ] as [$key, $value, $group]) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $key],
                ['id' => (string) Str::uuid(), 'value' => $value, 'group_name' => $group, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        foreach ([['ঢাকার ভিতরে', 70], ['ঢাকার বাইরে', 150]] as [$area, $charge]) {
            DB::table('shipping_charges')->updateOrInsert(
                ['area_name' => $area],
                ['id' => (string) Str::uuid(), 'charge' => $charge, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $admin = User::updateOrCreate(
            ['email' => 'lotusmostafiz@gmail.com'],
            ['name' => 'Admin', 'password' => Hash::make('1@#DremMart234@'), 'phone' => null]
        );

        DB::table('user_roles')->updateOrInsert(
            ['user_id' => (string) $admin->id, 'role' => 'admin'],
            ['id' => (string) Str::uuid(), 'created_at' => now(), 'updated_at' => now()]
        );
    }
}
