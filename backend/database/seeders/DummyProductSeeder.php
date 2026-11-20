<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DummyProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add Categories
        $categoryId1 = (string) Str::uuid();
        $categoryId2 = (string) Str::uuid();

        DB::table('categories')->insert([
            [
                'id' => $categoryId1,
                'name' => 'Super Foods',
                'slug' => 'super-foods',
                'image_url' => 'https://via.placeholder.com/150',
                'sort_order' => 1,
                'is_active' => true,
                'show_in_navbar' => true,
                'show_on_home' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $categoryId2,
                'name' => 'Organic Honey',
                'slug' => 'organic-honey',
                'image_url' => 'https://via.placeholder.com/150',
                'sort_order' => 2,
                'is_active' => true,
                'show_in_navbar' => true,
                'show_on_home' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Add Products
        $products = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'Premium Sundarban Honey',
                'slug' => 'premium-sundarban-honey',
                'description' => '100% pure organic honey from Sundarban.',
                'short_description' => 'Pure organic honey',
                'base_price' => 800.00,
                'sale_price' => 750.00,
                'stock_quantity' => 50,
                'category_id' => $categoryId2,
                'image_url' => 'https://via.placeholder.com/300x300?text=Honey',
                'images' => json_encode(['https://via.placeholder.com/300x300?text=Honey']),
                'is_active' => true,
                'is_featured' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Organic Chia Seeds',
                'slug' => 'organic-chia-seeds',
                'description' => 'High quality organic chia seeds rich in omega-3.',
                'short_description' => 'Healthy chia seeds',
                'base_price' => 600.00,
                'sale_price' => null,
                'stock_quantity' => 100,
                'category_id' => $categoryId1,
                'image_url' => 'https://via.placeholder.com/300x300?text=Chia+Seeds',
                'images' => json_encode(['https://via.placeholder.com/300x300?text=Chia+Seeds']),
                'is_active' => true,
                'is_featured' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Himalayan Pink Salt',
                'slug' => 'himalayan-pink-salt',
                'description' => 'Natural unrefined pink salt.',
                'short_description' => 'Natural pink salt',
                'base_price' => 250.00,
                'sale_price' => 220.00,
                'stock_quantity' => 200,
                'category_id' => $categoryId1,
                'image_url' => 'https://via.placeholder.com/300x300?text=Pink+Salt',
                'images' => json_encode(['https://via.placeholder.com/300x300?text=Pink+Salt']),
                'is_active' => true,
                'is_featured' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('products')->insert($products);
    }
}
