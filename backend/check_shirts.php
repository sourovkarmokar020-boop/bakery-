<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Find shirt category
$shirtCategory = DB::table('categories')->where('slug', 'clothing-men-shirt')->first();

if ($shirtCategory) {
    echo "Shirt Category ID: " . $shirtCategory->id . "\n";
    echo "Category Name: " . $shirtCategory->name . "\n\n";
    
    // Count products
    $count = DB::table('products')->where('category_id', $shirtCategory->id)->count();
    echo "Total Shirt Products: " . $count . "\n\n";
    
    // Get product names
    $products = DB::table('products')
        ->where('category_id', $shirtCategory->id)
        ->select('name', 'slug', 'base_price', 'stock_quantity')
        ->get();
    
    if ($products->count() > 0) {
        echo "Products:\n";
        echo "========================================\n";
        foreach ($products as $product) {
            echo "- " . $product->name . " (৳" . $product->base_price . ") [Stock: " . $product->stock_quantity . "]\n";
        }
    } else {
        echo "No products found!\n";
    }
} else {
    echo "Shirt category not found!\n";
}
