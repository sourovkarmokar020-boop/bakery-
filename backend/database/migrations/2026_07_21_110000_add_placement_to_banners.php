<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "placement" ঠিক করে একটা ব্যানার হোমপেজের কোন সেকশনে দেখাবে:
     *   - hero    → উপরের বড় স্লাইডার (HeroSlider)
     *   - fashion → ৩-কলামের ফ্যাশন সেল সেকশন (FashionSaleSlider)
     * এই কলাম যোগ করার পর পুরনো সব ব্যানার ডিফল্ট 'hero' হয়ে যায়, তাই
     * হিরো স্লাইডারে কোনো পরিবর্তন হয় না।
     */
    private array $fashionBanners = [
        [
            'id' => 'f1a11111-1111-4111-8111-111111111111',
            'title' => 'Summer Fashion Sale',
            'title_en' => 'Summer Fashion Sale',
            'title_bn' => 'সামার ফ্যাশন সেল',
            'image_url' => '/assets/uploads/offer1.jpg',
            'sort_order' => 1,
        ],
        [
            'id' => 'f2a22222-2222-4222-8222-222222222222',
            'title' => 'Mega Fashion Sale',
            'title_en' => 'Mega Fashion Sale',
            'title_bn' => 'মেগা ফ্যাশন সেল',
            'image_url' => '/assets/uploads/offer2.jpg',
            'sort_order' => 2,
        ],
        [
            'id' => 'f3a33333-3333-4333-8333-333333333333',
            'title' => 'Weekend Special Sale',
            'title_en' => 'Weekend Special Sale',
            'title_bn' => 'উইকেন্ড স্পেশাল সেল',
            'image_url' => '/assets/uploads/offer3.png',
            'sort_order' => 3,
        ],
    ];

    public function up(): void
    {
        if (! Schema::hasColumn('banners', 'placement')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->string('placement')->default('hero')->after('redirect_url');
            });
        }

        // পুরনো সব ব্যানার হিরো স্লাইডারেই থাকবে
        DB::table('banners')->whereNull('placement')->update(['placement' => 'hero']);

        // বর্তমান হার্ডকোড করা ৩টা ফ্যাশন ব্যানার ডাটাবেজে সিড করা হচ্ছে, যাতে
        // অ্যাডমিন ড্যাশবোর্ড থেকে এগুলো এডিট/রিপ্লেস করা যায়।
        $now = now();
        foreach ($this->fashionBanners as $banner) {
            $exists = DB::table('banners')->where('id', $banner['id'])->exists();
            if (! $exists) {
                DB::table('banners')->insert(array_merge($banner, [
                    'redirect_url' => '/categories',
                    'placement' => 'fashion',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        }
    }

    public function down(): void
    {
        DB::table('banners')
            ->whereIn('id', array_column($this->fashionBanners, 'id'))
            ->delete();

        if (Schema::hasColumn('banners', 'placement')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->dropColumn('placement');
            });
        }
    }
};
