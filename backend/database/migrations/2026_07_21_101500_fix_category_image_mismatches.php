<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Fixes the top-category images that were pointing at the wrong picture
 * (e.g. "bags" was showing an alarm clock, "watches" was showing spice
 * jars). Each slug below is matched to a picture that actually depicts it,
 * chosen from the images already present in public/assets/uploads/.
 *
 * Categories with no suitable image on disk (clothing, healthcare-supplements,
 * shoes, sports) are intentionally left untouched and handled separately.
 */
return new class extends Migration
{
    private array $map = [
        'bags'      => '/assets/uploads/category-images/ladies-bag.webp',
        'cosmetics' => '/assets/uploads/category-images/perfume.webp',
        'food-organic' => '/assets/uploads/category-images/eB1UP4dq4pE8EW7jWrsAVU5PY5JUowseLt40PhpS.webp',
        'watches'   => '/assets/uploads/category-images/aO4gO19MsMC1SXWdr0I0SOTTfE33LiKOxhksw2cJ.webp',
        'gadgets'   => '/assets/uploads/category-images/wmojxLeiENpIesu60YHvQUZ1y1kNgG5zoE7bXoNb.webp',
        // electronics-home-appliances already shows a digital clock — kept as-is.
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
        // Previous image_url values are not restored; they were incorrect.
    }
};
