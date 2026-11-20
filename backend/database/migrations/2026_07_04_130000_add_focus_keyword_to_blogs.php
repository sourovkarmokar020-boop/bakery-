<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('blogs', 'focus_keyword')) {
            Schema::table('blogs', function (Blueprint $table) {
                $table->string('focus_keyword')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('blogs', 'focus_keyword')) {
            Schema::table('blogs', function (Blueprint $table) {
                $table->dropColumn('focus_keyword');
            });
        }
    }
};
