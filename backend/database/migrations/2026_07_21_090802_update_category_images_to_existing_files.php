<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            // Assign existing uploaded category images to top categories
            $categoryImages = [
                'crockeries' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'ladies-bag' => '/assets/uploads/category-images/aO4gO19MsMC1SXWdr0I0SOTTfE33LiKOxhksw2cJ.webp',
                'mans-bag' => '/assets/uploads/category-images/eB1UP4dq4pE8EW7jWrsAVU5PY5JUowseLt40PhpS.webp',
                'babys-toy' => '/assets/uploads/category-images/F6WbpYZdE4km1cTZpO4DhQ61eZtCJLAkc24K2hO4.webp',
                'gift-item' => '/assets/uploads/category-images/gm4s1HHVV5DSdQBDXDLgfbgA0jfiuNyqAX4sWHaK.webp',
                'watch' => '/assets/uploads/category-images/JgfETFxvabnvmuYSHW3Vor1tETXuic2HIi26QVnH.webp',
                'lamp' => '/assets/uploads/category-images/QXxNkn9RPDuVm4I7AAIAyaydm5L2hpp3Cew5pZUj.webp',
                'water-bottle' => '/assets/uploads/category-images/sJxewSucmuDlGElK2sEyuwpNOrKGofKFH8Q1Vq2Z.webp',
                'perfume' => '/assets/uploads/category-images/tb0sZw1DBYiSzq9Lv23vtVpaPFITlB0yBRUdfnly.webp',
            ];

            foreach ($categoryImages as $slug => $imageUrl) {
                DB::table('categories')
                    ->where('slug', $slug)
                    ->whereNull('parent_id')
                    ->update([
                        'image_url' => $imageUrl,
                        'updated_at' => now(),
                    ]);
            }
        });
    }

    public function down(): void
    {
        // No need to revert - old image paths were already incorrect
    }
};
