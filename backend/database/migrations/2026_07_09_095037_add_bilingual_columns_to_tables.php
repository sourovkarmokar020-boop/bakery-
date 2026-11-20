<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. categories
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'name_en')) {
                $table->text('name_en')->nullable();
            }
            if (!Schema::hasColumn('categories', 'name_bn')) {
                $table->text('name_bn')->nullable();
            }
        });

        // 2. products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'name_en')) {
                $table->text('name_en')->nullable();
            }
            if (!Schema::hasColumn('products', 'name_bn')) {
                $table->text('name_bn')->nullable();
            }
            if (!Schema::hasColumn('products', 'short_description_en')) {
                $table->text('short_description_en')->nullable();
            }
            if (!Schema::hasColumn('products', 'short_description_bn')) {
                $table->text('short_description_bn')->nullable();
            }
            if (!Schema::hasColumn('products', 'description_en')) {
                $table->longText('description_en')->nullable();
            }
            if (!Schema::hasColumn('products', 'description_bn')) {
                $table->longText('description_bn')->nullable();
            }
            if (!Schema::hasColumn('products', 'weight_en')) {
                $table->string('weight_en')->nullable();
            }
            if (!Schema::hasColumn('products', 'weight_bn')) {
                $table->string('weight_bn')->nullable();
            }
            if (!Schema::hasColumn('products', 'unit_en')) {
                $table->string('unit_en')->nullable();
            }
            if (!Schema::hasColumn('products', 'unit_bn')) {
                $table->string('unit_bn')->nullable();
            }
        });

        // 3. banners
        Schema::table('banners', function (Blueprint $table) {
            if (!Schema::hasColumn('banners', 'title_en')) {
                $table->text('title_en')->nullable();
            }
            if (!Schema::hasColumn('banners', 'title_bn')) {
                $table->text('title_bn')->nullable();
            }
        });

        // 4. blogs
        Schema::table('blogs', function (Blueprint $table) {
            if (!Schema::hasColumn('blogs', 'title_en')) {
                $table->text('title_en')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'title_bn')) {
                $table->text('title_bn')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'excerpt_en')) {
                $table->text('excerpt_en')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'excerpt_bn')) {
                $table->text('excerpt_bn')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'content_en')) {
                $table->longText('content_en')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'content_bn')) {
                $table->longText('content_bn')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'category_en')) {
                $table->string('category_en')->nullable();
            }
            if (!Schema::hasColumn('blogs', 'category_bn')) {
                $table->string('category_bn')->nullable();
            }
        });

        // 5. pages
        Schema::table('pages', function (Blueprint $table) {
            if (!Schema::hasColumn('pages', 'title_en')) {
                $table->text('title_en')->nullable();
            }
            if (!Schema::hasColumn('pages', 'title_bn')) {
                $table->text('title_bn')->nullable();
            }
            if (!Schema::hasColumn('pages', 'content_en')) {
                $table->longText('content_en')->nullable();
            }
            if (!Schema::hasColumn('pages', 'content_bn')) {
                $table->longText('content_bn')->nullable();
            }
        });

        // 6. shipping_charges
        Schema::table('shipping_charges', function (Blueprint $table) {
            if (!Schema::hasColumn('shipping_charges', 'area_name_en')) {
                $table->text('area_name_en')->nullable();
            }
            if (!Schema::hasColumn('shipping_charges', 'area_name_bn')) {
                $table->text('area_name_bn')->nullable();
            }
        });

        // 7. videos
        Schema::table('videos', function (Blueprint $table) {
            if (!Schema::hasColumn('videos', 'title_en')) {
                $table->text('title_en')->nullable();
            }
            if (!Schema::hasColumn('videos', 'title_bn')) {
                $table->text('title_bn')->nullable();
            }
        });

        // 8. brands
        Schema::table('brands', function (Blueprint $table) {
            if (!Schema::hasColumn('brands', 'name_en')) {
                $table->text('name_en')->nullable();
            }
            if (!Schema::hasColumn('brands', 'name_bn')) {
                $table->text('name_bn')->nullable();
            }
        });

        // 9. sizes
        Schema::table('sizes', function (Blueprint $table) {
            if (!Schema::hasColumn('sizes', 'name_en')) {
                $table->text('name_en')->nullable();
            }
            if (!Schema::hasColumn('sizes', 'name_bn')) {
                $table->text('name_bn')->nullable();
            }
        });

        // 10. colors
        Schema::table('colors', function (Blueprint $table) {
            if (!Schema::hasColumn('colors', 'name_en')) {
                $table->text('name_en')->nullable();
            }
            if (!Schema::hasColumn('colors', 'name_bn')) {
                $table->text('name_bn')->nullable();
            }
        });

        // Backfill existing data
        try {
            // categories
            DB::table('categories')->whereNull('name_bn')->update(['name_bn' => DB::raw('name')]);
            DB::table('categories')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);

            // products
            DB::table('products')->whereNull('name_bn')->update(['name_bn' => DB::raw('name')]);
            DB::table('products')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);
            DB::table('products')->whereNull('short_description_bn')->update(['short_description_bn' => DB::raw('short_description')]);
            DB::table('products')->whereNull('short_description_en')->update(['short_description_en' => DB::raw('short_description')]);
            DB::table('products')->whereNull('description_bn')->update(['description_bn' => DB::raw('description')]);
            DB::table('products')->whereNull('description_en')->update(['description_en' => DB::raw('description')]);
            DB::table('products')->whereNull('weight_bn')->update(['weight_bn' => DB::raw('weight')]);
            DB::table('products')->whereNull('weight_en')->update(['weight_en' => DB::raw('weight')]);
            DB::table('products')->whereNull('unit_bn')->update(['unit_bn' => DB::raw('unit')]);
            DB::table('products')->whereNull('unit_en')->update(['unit_en' => DB::raw('unit')]);

            // banners
            DB::table('banners')->whereNull('title_bn')->update(['title_bn' => DB::raw('title')]);
            DB::table('banners')->whereNull('title_en')->update(['title_en' => DB::raw('title')]);

            // blogs
            DB::table('blogs')->whereNull('title_bn')->update(['title_bn' => DB::raw('title')]);
            DB::table('blogs')->whereNull('title_en')->update(['title_en' => DB::raw('title')]);
            DB::table('blogs')->whereNull('excerpt_bn')->update(['excerpt_bn' => DB::raw('excerpt')]);
            DB::table('blogs')->whereNull('excerpt_en')->update(['excerpt_en' => DB::raw('excerpt')]);
            DB::table('blogs')->whereNull('content_bn')->update(['content_bn' => DB::raw('content')]);
            DB::table('blogs')->whereNull('content_en')->update(['content_en' => DB::raw('content')]);
            DB::table('blogs')->whereNull('category_bn')->update(['category_bn' => DB::raw('category')]);
            DB::table('blogs')->whereNull('category_en')->update(['category_en' => DB::raw('category')]);

            // pages
            DB::table('pages')->whereNull('title_bn')->update(['title_bn' => DB::raw('title')]);
            DB::table('pages')->whereNull('title_en')->update(['title_en' => DB::raw('title')]);
            DB::table('pages')->whereNull('content_bn')->update(['content_bn' => DB::raw('content')]);
            DB::table('pages')->whereNull('content_en')->update(['content_en' => DB::raw('content')]);

            // shipping_charges
            DB::table('shipping_charges')->whereNull('area_name_bn')->update(['area_name_bn' => DB::raw('area_name')]);
            DB::table('shipping_charges')->whereNull('area_name_en')->update(['area_name_en' => DB::raw('area_name')]);

            // videos
            DB::table('videos')->whereNull('title_bn')->update(['title_bn' => DB::raw('title')]);
            DB::table('videos')->whereNull('title_en')->update(['title_en' => DB::raw('title')]);

            // brands
            DB::table('brands')->whereNull('name_bn')->update(['name_bn' => DB::raw('name')]);
            DB::table('brands')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);

            // sizes
            DB::table('sizes')->whereNull('name_bn')->update(['name_bn' => DB::raw('name')]);
            DB::table('sizes')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);

            // colors
            DB::table('colors')->whereNull('name_bn')->update(['name_bn' => DB::raw('name')]);
            DB::table('colors')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);
        } catch (\Exception $e) {
            // Ignore backfill errors
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. categories
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'name_en')) {
                $table->dropColumn('name_en');
            }
            if (Schema::hasColumn('categories', 'name_bn')) {
                $table->dropColumn('name_bn');
            }
        });

        // 2. products
        Schema::table('products', function (Blueprint $table) {
            $cols = ['name_en', 'name_bn', 'short_description_en', 'short_description_bn', 'description_en', 'description_bn', 'weight_en', 'weight_bn', 'unit_en', 'unit_bn'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('products', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 3. banners
        Schema::table('banners', function (Blueprint $table) {
            if (Schema::hasColumn('banners', 'title_en')) {
                $table->dropColumn('title_en');
            }
            if (Schema::hasColumn('banners', 'title_bn')) {
                $table->dropColumn('title_bn');
            }
        });

        // 4. blogs
        Schema::table('blogs', function (Blueprint $table) {
            $cols = ['title_en', 'title_bn', 'excerpt_en', 'excerpt_bn', 'content_en', 'content_bn', 'category_en', 'category_bn'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('blogs', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 5. pages
        Schema::table('pages', function (Blueprint $table) {
            $cols = ['title_en', 'title_bn', 'content_en', 'content_bn'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('pages', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 6. shipping_charges
        Schema::table('shipping_charges', function (Blueprint $table) {
            if (Schema::hasColumn('shipping_charges', 'area_name_en')) {
                $table->dropColumn('area_name_en');
            }
            if (Schema::hasColumn('shipping_charges', 'area_name_bn')) {
                $table->dropColumn('area_name_bn');
            }
        });

        // 7. videos
        Schema::table('videos', function (Blueprint $table) {
            if (Schema::hasColumn('videos', 'title_en')) {
                $table->dropColumn('title_en');
            }
            if (Schema::hasColumn('videos', 'title_bn')) {
                $table->dropColumn('title_bn');
            }
        });

        // 8. brands
        Schema::table('brands', function (Blueprint $table) {
            if (Schema::hasColumn('brands', 'name_en')) {
                $table->dropColumn('name_en');
            }
            if (Schema::hasColumn('brands', 'name_bn')) {
                $table->dropColumn('name_bn');
            }
        });

        // 9. sizes
        Schema::table('sizes', function (Blueprint $table) {
            if (Schema::hasColumn('sizes', 'name_en')) {
                $table->dropColumn('name_en');
            }
            if (Schema::hasColumn('sizes', 'name_bn')) {
                $table->dropColumn('name_bn');
            }
        });

        // 10. colors
        Schema::table('colors', function (Blueprint $table) {
            if (Schema::hasColumn('colors', 'name_en')) {
                $table->dropColumn('name_en');
            }
            if (Schema::hasColumn('colors', 'name_bn')) {
                $table->dropColumn('name_bn');
            }
        });
    }
};
