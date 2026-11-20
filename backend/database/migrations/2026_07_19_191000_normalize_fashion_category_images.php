<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $images = [
            'ladies-bag' => '/assets/uploads/category-images/ladies-bag.webp',
            'mans-bag' => '/assets/uploads/category-images/mans-bag.webp',
            'perfume' => '/assets/uploads/category-images/perfume.webp',
        ];

        foreach ($images as $slug => $imageUrl) {
            DB::table('categories')->where('slug', $slug)->update([
                'image_url' => $imageUrl,
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        $images = [
            'ladies-bag' => '/assets/uploads/category-images/ladies-bag.png',
            'mans-bag' => '/assets/uploads/category-images/mans-bag.png',
            'perfume' => '/assets/uploads/category-images/perfume.png',
        ];

        foreach ($images as $slug => $imageUrl) {
            DB::table('categories')->where('slug', $slug)->update([
                'image_url' => $imageUrl,
                'updated_at' => now(),
            ]);
        }
    }
};
