<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('blogs')) {
            Schema::create('blogs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->text('title');
                $table->string('slug')->unique();
                $table->text('excerpt')->nullable();
                $table->longText('content')->nullable();
                $table->string('category')->nullable();
                $table->text('image_url')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('videos')) {
            Schema::create('videos', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->text('title');
                $table->text('video_url');
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // আগের hardcoded ভিডিওগুলো seed — thumbnail YouTube থেকে নিজে থেকেই আসে
        if (DB::table('videos')->count() === 0) {
            $videos = [
                ['সুন্দরবনের বিশাল বড় চাক কেটে মধু সংগ্রহ', 'https://www.youtube.com/watch?v=Plrux0TMk7I'],
                ['সুন্দরবনের বিশাল বড় চাক কেটে মধু সংগ্রহ', 'https://www.youtube.com/watch?v=SMh4tRuUv00'],
                ['সৌদি আরব খেজুরের দাম বিস্তারিত জানুন', 'https://www.youtube.com/watch?v=PGid7mcQqgg'],
                ['যে গুড় খেয়ে অভিভূত হয়েছিলেন রানী এলিজাবেথ', 'https://www.youtube.com/watch?v=F1h_lVbUmHE'],
            ];
            foreach ($videos as $i => [$title, $url]) {
                DB::table('videos')->insert([
                    'id' => (string) Str::uuid(),
                    'title' => $title,
                    'video_url' => $url,
                    'sort_order' => $i + 1,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('videos');
    }
};
