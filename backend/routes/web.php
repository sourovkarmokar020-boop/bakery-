<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

// Serve storage files (workaround for symlink issues on Windows)
Route::get('/storage/{path}', function (Request $request, string $path) {
    // Decode the path to handle any URL encoding
    $path = urldecode($path);
    
    // Security check: prevent directory traversal
    if (str_contains($path, '..') || str_contains($path, './')) {
        abort(403, 'Forbidden');
    }
    
    // Check if file exists in public disk
    if (!Storage::disk('public')->exists($path)) {
        abort(404, 'File not found');
    }
    
    // Get file path and determine mime type
    $filePath = Storage::disk('public')->path($path);
    $mimeType = Storage::disk('public')->mimeType($path);
    
    // Return file response with appropriate headers
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000', // Cache for 1 year
    ]);
})->where('path', '.*');
