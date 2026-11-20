<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('banners')
            ->where('id', '2dee618f-0a72-4647-864d-62871bd79fbc')
            ->update([
                'image_url' => '/assets/uploads/banner-images/hero-fashion-gifts-v2.webp',
                'updated_at' => now(),
            ]);

        DB::table('banners')
            ->where('id', '47d79d3e-b8ec-41d2-a218-43254ab4a939')
            ->update([
                'image_url' => '/assets/uploads/banner-images/hero-home-essentials-v2.webp',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        DB::table('banners')
            ->where('id', '2dee618f-0a72-4647-864d-62871bd79fbc')
            ->update([
                'image_url' => '/assets/uploads/banner-images/PigBF5ndhMTfyeeVInMDvgKEnhA48st7JZBb8Ooi.webp',
                'updated_at' => now(),
            ]);

        DB::table('banners')
            ->where('id', '47d79d3e-b8ec-41d2-a218-43254ab4a939')
            ->update([
                'image_url' => '/assets/uploads/banner-images/vIEsag1J9cl2bUGymqmC1dayfdZ8fZSVUs3sj8Zb.webp',
                'updated_at' => now(),
            ]);
    }
};
