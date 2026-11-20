<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            // Assign images to ALL categories including both existing and new ones
            // This ensures both English and Bangla names work correctly
            $categoryImages = [
                // Main top-level categories with dedicated images
                'clothing' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'sports' => '/assets/uploads/category-images/aO4gO19MsMC1SXWdr0I0SOTTfE33LiKOxhksw2cJ.webp',
                'watches' => '/assets/uploads/category-images/aO4gO19MsMC1SXWdr0I0SOTTfE33LiKOxhksw2cJ.webp',
                'gadgets' => '/assets/uploads/category-images/F6WbpYZdE4km1cTZpO4DhQ61eZtCJLAkc24K2hO4.webp',
                'cosmetics' => '/assets/uploads/category-images/gm4s1HHVV5DSdQBDXDLgfbgA0jfiuNyqAX4sWHaK.webp',
                'food-organic' => '/assets/uploads/category-images/JgfETFxvabnvmuYSHW3Vor1tETXuic2HIi26QVnH.webp',
                'healthcare-supplements' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
                'shoes' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
                'electronics-home-appliances' => '/assets/uploads/category-images/tb0sZw1DBYiSzq9Lv23vtVpaPFITlB0yBRUdfnly.webp',
                'bags' => '/assets/uploads/category-images/upqkqSYFna5jOIJ4lng0UMHP5eNYctThw8lP2baG.webp',
                
                // New categories from preserve_categories migration
                'crockeries' => '/assets/uploads/product-images/zW2AUevvenCBcqORoBbXYzvmDTHAEiaqVmgx440m.webp',
                'ladies-bag' => '/assets/uploads/category-images/ladies-bag.png',
                'mans-bag' => '/assets/uploads/category-images/mans-bag.png',
                'babys-toy' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg',
                'gift-item' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u09.jpeg',
                'watch' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u18.jpeg',
                'lamp' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u03.jpeg',
                'water-bottle' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u49.jpeg',
                'perfume' => '/assets/uploads/category-images/perfume.png',
                'hand-watch' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u18.jpeg',
                'alarm-clock' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u24.jpeg',
                'wall-clock' => '/assets/uploads/product-images/wall-clock-product.png',
                
                // Sub-categories that currently have no images
                'clothing-baby-dress' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                'clothing-women' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                'clothing-baby-feeding-bottle' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg',
                'clothing-men-tshirt' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'clothing-men-lungi' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'clothing-baby-shoes' => '/assets/uploads/category-images/shoes.jpg',
                'clothing-men-pants' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'sports-jersey' => '/assets/uploads/category-images/sports.jpg',
                'clothing-baby-toys' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg',
                'sports-sneakers' => '/assets/uploads/category-images/sports.jpg',
                'shoes-women' => '/assets/uploads/category-images/shoes.jpg',
                'clothing-men-jackets' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'clothing-baby-newborn-set' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg',
                'clothing-women-salwar-kameez' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                'clothing-men' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'clothing-women-three-piece' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                'clothing-baby' => '/assets/uploads/product-images/whatsapp-20260709/fm-20260709-u53.jpeg',
                'shoes-men' => '/assets/uploads/category-images/shoes.jpg',
                'clothing-women-burqa' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                'shoes-baby' => '/assets/uploads/category-images/shoes.jpg',
                'sports-trousers' => '/assets/uploads/category-images/sports.jpg',
                'clothing-women-night-dress' => '/assets/uploads/product-images/fashion/elegant-beige-quilted-shoulder-bag.webp',
                'clothing-men-shirt' => '/assets/uploads/category-images/7pRKD4XPXOEG85pqtHS2Y6sGOz0OvRjx2y0h8O8N.webp',
                'sports-running-shoes' => '/assets/uploads/category-images/sports.jpg',
            ];

            foreach ($categoryImages as $slug => $imageUrl) {
                // Update categories by slug, ensuring both English and Bangla work
                $updated = DB::table('categories')
                    ->where('slug', $slug)
                    ->update([
                        'image_url' => $imageUrl,
                        'updated_at' => now(),
                    ]);
                
                // Log if category doesn't exist yet (will be created by other migrations)
                if ($updated === 0) {
                    echo "Category '{$slug}' not found yet, will be created by other migrations\n";
                }
            }
        });
    }

    public function down(): void
    {
        // Clear image URLs for all these categories
        DB::table('categories')
            ->whereIn('slug', [
                'clothing', 'sports', 'watches', 'gadgets', 'cosmetics',
                'food-organic', 'healthcare-supplements', 'shoes',
                'electronics-home-appliances', 'bags',
                'crockeries', 'ladies-bag', 'mans-bag', 'babys-toy', 'gift-item',
                'watch', 'lamp', 'water-bottle', 'perfume', 'hand-watch',
                'alarm-clock', 'wall-clock',
                'clothing-baby-dress', 'clothing-women', 'clothing-baby-feeding-bottle',
                'clothing-men-tshirt', 'clothing-men-lungi', 'clothing-baby-shoes',
                'clothing-men-pants', 'sports-jersey', 'clothing-baby-toys',
                'sports-sneakers', 'shoes-women', 'clothing-men-jackets',
                'clothing-baby-newborn-set', 'clothing-women-salwar-kameez',
                'clothing-men', 'clothing-women-three-piece', 'clothing-baby',
                'shoes-men', 'clothing-women-burqa', 'shoes-baby',
                'sports-trousers', 'clothing-women-night-dress', 'clothing-men-shirt',
                'sports-running-shoes'
            ])
            ->update(['image_url' => null]);
    }
};
