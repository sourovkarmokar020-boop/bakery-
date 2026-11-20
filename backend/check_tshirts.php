<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$products = DB::table('products')
    ->where('name_en', 'like', '%T-Shirt%')
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get(['id', 'name_en', 'name_bn', 'sale_price', 'stock_quantity', 'is_active']);

echo "Total T-Shirt Products: " . $products->count() . "\n\n";

foreach ($products as $product) {
    echo "✓ {$product->name_en} / {$product->name_bn}\n";
    echo "  Price: ৳{$product->sale_price} | Stock: {$product->stock_quantity} | Active: " . ($product->is_active ? 'Yes' : 'No') . "\n\n";
}

// Also check category
$category = DB::table('categories')
    ->where('slug', 'like', '%tshirt%')
    ->orWhere('name_en', 'like', '%T-Shirt%')
    ->first(['id', 'name_en', 'name_bn', 'slug', 'parent_id']);

if ($category) {
    echo "\nCategory: {$category->name_en} / {$category->name_bn}\n";
    echo "Slug: {$category->slug}\n";
    echo "Parent ID: " . ($category->parent_id ?? 'None') . "\n";
}
