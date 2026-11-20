<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $images = [
            'crockeries' => '/assets/uploads/product-images/zW2AUevvenCBcqORoBbXYzvmDTHAEiaqVmgx440m.webp',
            'ladies-bag' => '/placeholder.svg',
            'mans-bag' => '/placeholder.svg',
            'babys-toy' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg',
            'gift-item' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u09.jpeg',
            'watch' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u18.jpeg',
            'hand-watch' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u18.jpeg',
            'alarm-clock' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u24.jpeg',
            'wall-clock' => '/assets/uploads/product-images/wall-clock-product.png',
            'lamp' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u03.jpeg',
            'water-bottle' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u49.jpeg',
            'perfume' => '/placeholder.svg',
            'electronic-item' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u01.jpeg',
            'kitchen-appliances' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u38.jpeg',
            'travel-accessories' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u52.jpeg',
        ];

        foreach ($images as $slug => $imageUrl) {
            DB::table('categories')
                ->where('slug', $slug)
                ->update(['image_url' => $imageUrl, 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        // Category images are safe catalog corrections and should be retained.
    }
};
