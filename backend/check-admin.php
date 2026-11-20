<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "=== Checking Admin User ===\n\n";

// Check if user exists
$user = User::where('email', 'lotusmostafiz@gmail.com')->first();

if ($user) {
    echo "✓ User found!\n";
    echo "  ID: {$user->id}\n";
    echo "  Name: {$user->name}\n";
    echo "  Email: {$user->email}\n";
    
    // Check role
    $role = DB::table('user_roles')
        ->where('user_id', $user->id)
        ->value('role');
    
    if ($role) {
        echo "  Role: {$role}\n";
    } else {
        echo "  ✗ No role assigned!\n";
    }
    
    // Test password
    echo "\n=== Testing Password ===\n";
    $testPassword = '1@#DremMart234@';
    
    if (Hash::check($testPassword, $user->password)) {
        echo "✓ Password matches!\n";
    } else {
        echo "✗ Password does NOT match!\n";
        echo "Trying to update password...\n";
        
        $user->password = Hash::make($testPassword);
        $user->save();
        
        echo "✓ Password updated successfully!\n";
    }
    
} else {
    echo "✗ User not found!\n";
    echo "Creating admin user...\n";
    
    $user = User::create([
        'name' => 'Admin',
        'email' => 'lotusmostafiz@gmail.com',
        'password' => Hash::make('1@#DremMart234@'),
        'phone' => null,
    ]);
    
    echo "✓ User created with ID: {$user->id}\n";
    
    // Assign admin role
    DB::table('user_roles')->insert([
        'id' => \Illuminate\Support\Str::uuid()->toString(),
        'user_id' => $user->id,
        'role' => 'admin',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✓ Admin role assigned!\n";
}

echo "\n=== Summary ===\n";
echo "Email: lotusmostafiz@gmail.com\n";
echo "Password: 1@#DremMart234@\n";
