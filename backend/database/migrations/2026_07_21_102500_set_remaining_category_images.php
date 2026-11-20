<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Sets the cover image for the four top categories that previously had no
 * suitable picture (clothing, healthcare-supplements, shoes, sports). The
 * files were supplied by the shop owner and copied into
 * public/assets/uploads/category-images/. This replaces the broken
 * "image generating" placeholders that were on shoes and healthcare.
 */
return new class extends Migration
{
    private array $map = [
        'clothing'               => '/assets/uploads/category-images/clothing.jpg',
        'healthcare-supplements' => '/assets/uploads/category-images/healthcare-supplements.jpg',
        'shoes'                  => '/assets/uploads/category-images/shoes.jpg',
        'sports'                 => '/assets/uploads/category-images/sports.jpg',
    ];

    public function up(): void
    {
        foreach ($this->map as $slug => $imageUrl) {
            DB::table('categories')
                ->where('slug', $slug)
                ->whereNull('parent_id')
                ->update([
                    'image_url' => $imageUrl,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        DB::table('categories')
            ->whereIn('slug', array_keys($this->map))
            ->whereNull('parent_id')
            ->update(['image_url' => null]);
    }
};
