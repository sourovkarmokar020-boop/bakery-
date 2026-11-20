<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * ফুটারের লোগোর নিচে দেখানো ঠিকানা ও ফোন নম্বর।
 *
 * সাইটের বাকি জায়গার নম্বর (টপ বার, প্রোডাক্ট পেজের কল বাটন, ইনভয়েস) `site_phone` /
 * `site_address` থেকেই আসে — সেগুলো না ছুঁয়ে ফুটারের জন্য আলাদা কী রাখা হয়েছে, যাতে
 * একটার বদল অন্যটাকে না টানে। দুটোই অ্যাডমিন প্যানেল → সেটিংস → ফুটার সেটিংস →
 * "ঠিকানা ও ফোন" থেকে বদলানো যায়।
 *
 * অ্যাডমিন হাতে বদলানো মান যেন migration আবার চালালে মুছে না যায় — তাই আগে থেকে
 * থাকলে (ফাঁকা না হলে) ছোঁয়া হয় না।
 */
return new class extends Migration
{
    private const VALUES = [
        'footer_address' => 'Address-House-26,Road-2,Adabor,Dhaka-1207.',
        'footer_phone' => '01680310063',
    ];

    public function up(): void
    {
        foreach (self::VALUES as $key => $value) {
            $existing = DB::table('site_settings')->where('key', $key)->first();

            if ($existing === null) {
                DB::table('site_settings')->insert([
                    'id' => (string) Str::uuid(),
                    'key' => $key,
                    'value' => $value,
                    'group_name' => 'footer',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                continue;
            }

            if (blank($existing->value)) {
                DB::table('site_settings')
                    ->where('key', $key)
                    ->update(['value' => $value, 'updated_at' => now()]);
            }
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', array_keys(self::VALUES))->delete();
    }
};
