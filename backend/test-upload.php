<?php
// Test upload functionality

// Check if storage directories exist
$storagePath = __DIR__ . '/storage/app/public/uploads/product-images';
$publicPath = __DIR__ . '/public/storage';

echo "=== Storage Path Test ===\n";
echo "Storage path: $storagePath\n";
echo "Storage path exists: " . (is_dir($storagePath) ? 'YES' : 'NO') . "\n";
echo "Storage path writable: " . (is_writable($storagePath) ? 'YES' : 'NO') . "\n";

echo "\n=== Public Path Test ===\n";
echo "Public path: $publicPath\n";
echo "Public path exists: " . (file_exists($publicPath) ? 'YES' : 'NO') . "\n";

if (file_exists($publicPath)) {
    if (is_link($publicPath)) {
        echo "Public path is a symlink\n";
        echo "Symlink target: " . readlink($publicPath) . "\n";
    } elseif (is_dir($publicPath)) {
        echo "Public path is a regular directory\n";
    }
}

echo "\n=== Test File Creation ===\n";
$testFile = $storagePath . '/test-' . time() . '.txt';
$result = file_put_contents($testFile, 'Test content');
if ($result !== false) {
    echo "✓ Successfully created test file: $testFile\n";
    echo "File size: $result bytes\n";
    
    // Try to access it via public URL
    $relativePath = 'uploads/product-images/' . basename($testFile);
    $publicUrl = 'http://127.0.0.1:8000/storage/' . $relativePath;
    echo "Public URL would be: $publicUrl\n";
    
    // Clean up
    unlink($testFile);
    echo "✓ Test file deleted\n";
} else {
    echo "✗ Failed to create test file\n";
    echo "Error: " . error_get_last()['message'] . "\n";
}

echo "\n=== Directory Permissions ===\n";
echo "Storage app/public: " . substr(sprintf('%o', fileperms(__DIR__ . '/storage/app/public')), -4) . "\n";
if (is_dir($storagePath)) {
    echo "Product images folder: " . substr(sprintf('%o', fileperms($storagePath)), -4) . "\n";
}
