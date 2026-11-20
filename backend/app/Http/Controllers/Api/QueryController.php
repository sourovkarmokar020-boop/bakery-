<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class QueryController extends Controller
{
    private array $tables = [
        'users', 'user_roles', 'profiles', 'categories', 'brands', 'colors', 'sizes', 'products',
        'product_variants', 'order_statuses', 'orders', 'order_items', 'customers',
        'site_settings', 'shipping_charges', 'banner_categories', 'banners', 'pages',
        'social_media', 'tracking_pixels', 'coupons', 'abandoned_carts', 'blocked_customers',
        'tracking_events_log', 'blogs', 'videos', 'reviews',
    ];

    public function home(): JsonResponse
    {
        $data = Cache::remember('storefront_home_data_v5', now()->addSeconds(30), function () {
            // হোমপেজ প্রতিটি ক্যাটাগরির জন্য এখান থেকেই পণ্য বাছাই করে। লিমিট ক্যাটালগের
            // চেয়ে ছোট হলে পুরনো ক্যাটাগরিগুলোর (যেমন ব্যাগ, কসমেটিকস) পণ্য পেলোডেই আসে না,
            // ফলে হোমপেজে ওই সেকশনগুলো ফাঁকা দেখায় — তাই লিমিট যথেষ্ট বড় রাখা হয়েছে।
            $products = DB::table('products')
                ->where('is_active', true)
                ->orderByDesc('created_at')
                ->limit(400)
                ->get([
                    'id', 'name', 'name_en', 'name_bn', 'slug',
                    'base_price', 'sale_price', 'sku', 'stock_quantity',
                    'category_id', 'brand_id', 'image_url', 'is_active', 'is_featured',
                    'weight', 'weight_en', 'weight_bn', 'unit', 'unit_en', 'unit_bn',
                ])
                ->map(fn ($row) => $this->normalize($row))
                ->all();

            $products = $this->withRelations(
                'products',
                $products,
                '*, categories(name, name_en, name_bn, slug), brands(name)'
            );

            $categories = DB::table('categories')
                ->where('is_active', true)
                ->where('show_on_home', true)
                ->whereNull('parent_id')
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($row) => $this->normalize($row))
                ->all();

            // অতিরিক্ত কলাম (image_url, sort_order, show_on_home, show_in_navbar) সহ পাঠানো হয়
            // যাতে Header ন্যাভবার ও TopCategories আলাদা করে categories ফেচ না করে এই একটি
            // পেলোড থেকেই কাজ চালাতে পারে — হোমপেজে অনেকগুলো সমান্তরাল রিকোয়েস্ট কমে।
            $allCategories = DB::table('categories')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get([
                    'id', 'parent_id', 'name', 'name_en', 'name_bn', 'slug',
                    'image_url', 'sort_order', 'show_on_home', 'show_in_navbar',
                ])
                ->map(fn ($row) => $this->normalize($row))
                ->all();

            return compact('products', 'categories', 'allCategories');
        });

        return response()->json(['data' => $data])
            ->header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    }

    public function handle(Request $request, string $table): JsonResponse
    {
        abort_unless(in_array($table, $this->tables, true), 404);

        $action = $request->string('action')->toString();
        $select = $request->string('select', '*')->toString();

        return match ($action) {
            'select' => $this->select($request, $table, $select),
            'insert' => $this->insert($request, $table, $select),
            'update' => $this->update($request, $table, $select),
            'delete' => $this->delete($request, $table),
            default => response()->json(['message' => 'Unsupported action'], 422),
        };
    }

    public function rpc(Request $request, string $name): JsonResponse
    {
        if ($name === 'get_email_by_phone') {
            $email = DB::table('customers')->where('phone', $request->input('_phone'))->value('email');

            return response()->json(['data' => $email]);
        }

        return response()->json(['message' => 'Unsupported RPC'], 404);
    }

    public function upload(Request $request, string $bucket): JsonResponse
    {
        try {
            \Log::info('Upload request received', [
                'bucket' => $bucket,
                'has_file' => $request->hasFile('file'),
                'all_files' => $request->allFiles(),
            ]);
            
            $request->validate(['file' => ['required', 'file', 'max:5120']]);
            
            if (!$request->hasFile('file')) {
                \Log::error('No file in request');
                return response()->json(['error' => 'No file uploaded'], 400);
            }
            
            $file = $request->file('file');
            \Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]);
            
            $path = $file->store("uploads/$bucket", 'public');
            
            if (!$path) {
                \Log::error('Failed to store file');
                return response()->json(['error' => 'Failed to store file'], 500);
            }
            
            \Log::info('File stored successfully', ['path' => $path]);
            
            $publicUrl = asset('storage/'.$path);
            
            return response()->json([
                'path' => $path, 
                'public_url' => $publicUrl
            ]);
        } catch (\Exception $e) {
            \Log::error('Upload error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function select(Request $request, string $table, string $select): JsonResponse
    {
        $query = $this->applyQuery(DB::table($table), $request);

        if ($request->boolean('head')) {
            return response()->json(['data' => null, 'count' => $query->count()]);
        }

        $rows = $query->get($this->columns($table, $select))->map(fn ($row) => $this->normalize($row))->all();
        $rows = $this->withRelations($table, $rows, $select);
        $rows = $this->maskSensitive($table, $rows);

        if ($request->boolean('single') || $request->boolean('maybeSingle')) {
            return response()->json(['data' => $rows[0] ?? null]);
        }

        return response()->json(['data' => $rows, 'count' => count($rows)]);
    }

    private function insert(Request $request, string $table, string $select): JsonResponse
    {
        $rows = $this->rows($request->input('values', []));
        $now = now();

        if ($table === 'orders') {
            $ip = $request->ip();
            foreach ($rows as $row) {
                $phone = $row['customer_phone'] ?? null;
                $phoneBlocked = $phone && DB::table('blocked_customers')->where('phone', $phone)->exists();
                $ipBlocked = $ip && DB::table('blocked_customers')->where('ip_address', $ip)->exists();
                if ($phoneBlocked || $ipBlocked) {
                    return response()->json(['message' => 'এই অর্ডারটি গ্রহণ করা যায়নি। বিস্তারিত জানতে যোগাযোগ করুন।'], 403);
                }
            }
        }

        foreach ($rows as &$row) {
            $row['id'] ??= (string) Str::uuid();
            if ($table === 'orders') {
                $row['customer_ip'] = $request->ip();
            }
            if (Schema::hasColumn($table, 'created_at')) {
                $row['created_at'] ??= $now;
            }
            if (Schema::hasColumn($table, 'updated_at')) {
                $row['updated_at'] ??= $now;
            }
            $row = $this->filterColumns($table, $row);
        }

        DB::table($table)->insert($rows);
        $data = DB::table($table)->whereIn('id', array_column($rows, 'id'))->get($this->columns($table, $select))->map(fn ($row) => $this->normalize($row))->all();

        return response()->json(['data' => count($data) === 1 ? $data[0] : $data], 201);
    }

    private function update(Request $request, string $table, string $select): JsonResponse
    {
        $payload = $this->filterColumns($table, $request->input('values', []));
        if (Schema::hasColumn($table, 'updated_at')) {
            $payload['updated_at'] = now();
        }

        $query = $this->applyFilters(DB::table($table), $request->input('filters', []));
        $ids = (clone $query)->pluck('id')->all();

        // স্ট্যাটাস বদলের আগের অবস্থা ধরে রাখা হয়, যাতে একই স্ট্যাটাস আবার
        // সেভ করলে দ্বিতীয়বার কয়েন না দেওয়া হয়
        $previousStatuses = [];
        if ($table === 'orders' && array_key_exists('status_id', $payload)) {
            $previousStatuses = DB::table('orders')->whereIn('id', $ids)->pluck('status_id', 'id')->all();
        }

        $query->update($payload);

        if ($previousStatuses !== []) {
            $this->syncOrderCoins($ids, $previousStatuses, (string) $payload['status_id']);
        }

        $data = DB::table($table)->whereIn('id', $ids)->get($this->columns($table, $select))->map(fn ($row) => $this->normalize($row))->all();

        return response()->json(['data' => count($data) === 1 ? $data[0] : $data]);
    }

    /**
     * অর্ডারের স্ট্যাটাস বদলালে কয়েন জমা বা ফেরত।
     *
     * কয়েনের কোনো সমস্যা যেন অর্ডার আপডেট আটকে না দেয় — তাই পুরোটা try/catch এ।
     * ডুপ্লিকেট জমা ঠেকায় CoinService-এর idempotency_key, এখানকার চেক নয়।
     */
    private function syncOrderCoins(array $ids, array $previousStatuses, string $newStatusId): void
    {
        $status = DB::table('order_statuses')->where('id', $newStatusId)->first();
        if (! $status) {
            return;
        }

        $coins = app(\App\Services\CoinService::class);
        if (! $coins->isEnabled()) {
            return;
        }

        foreach ($ids as $id) {
            if ((string) ($previousStatuses[$id] ?? '') === $newStatusId) {
                continue;
            }

            try {
                if ($status->is_coin_earning ?? false) {
                    $coins->earnForOrder((string) $id);
                } elseif ($status->is_coin_reversing ?? false) {
                    $coins->reverseForOrder((string) $id, 'অর্ডার '.$status->name);
                }
            } catch (\Throwable $e) {
                \Log::error('Coin sync failed', ['order_id' => $id, 'error' => $e->getMessage()]);
            }
        }
    }

    private function delete(Request $request, string $table): JsonResponse
    {
        $deleted = $this->applyFilters(DB::table($table), $request->input('filters', []))->delete();

        return response()->json(['data' => null, 'count' => $deleted]);
    }

    private function applyQuery(Builder $query, Request $request): Builder
    {
        $query = $this->applyFilters($query, $request->input('filters', []));

        foreach ($request->input('orders', []) as $order) {
            $query->orderBy($order['column'], ($order['ascending'] ?? true) ? 'asc' : 'desc');
        }

        if ($request->filled('limit')) {
            $query->limit((int) $request->input('limit'));
        }

        return $query;
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        foreach ($filters as $filter) {
            $column = $filter['column'];
            $value = $filter['value'] ?? null;
            match ($filter['op']) {
                'eq' => $query->where($column, $value),
                'neq' => $query->where($column, '!=', $value),
                'is' => $value === null ? $query->whereNull($column) : $query->where($column, $value),
                'not' => $filter['operator'] === 'is' && $value === null ? $query->whereNotNull($column) : $query->where($column, '!=', $value),
                'gte' => $query->where($column, '>=', $value),
                'lte' => $query->where($column, '<=', $value),
                'gt' => $query->where($column, '>', $value),
                'lt' => $query->where($column, '<', $value),
                'in' => $query->whereIn($column, (array) $value),
                default => null,
            };
        }

        return $query;
    }

    private array $relations = [
        'products' => [
            'categories' => ['categories', 'category_id', ['id', 'name', 'name_en', 'name_bn', 'slug', 'parent_id']],
            'brands' => ['brands', 'brand_id', ['id', 'name']],
        ],
        'orders' => [
            'order_statuses' => ['order_statuses', 'status_id', ['id', 'name', 'color']],
        ],
        'order_items' => [
            'orders' => ['orders', 'order_id', ['id', 'order_number', 'customer_name', 'customer_phone', 'created_at', 'status_id']],
        ],
        'product_variants' => [
            'sizes' => ['sizes', 'size_id', ['id', 'name', 'value']],
            'colors' => ['colors', 'color_id', ['id', 'name', 'hex_code']],
        ],
        'reviews' => [
            'products' => ['products', 'product_id', ['id', 'name', 'slug']],
        ],
    ];

    private function withRelations(string $table, array $rows, string $select): array
    {
        foreach ($this->relations[$table] ?? [] as $key => [$relTable, $foreignKey, $columns]) {
            if (! str_contains($select, $key.'(')) {
                continue;
            }

            $ids = array_values(array_unique(array_filter(array_column($rows, $foreignKey))));
            $related = $ids === []
                ? []
                : DB::table($relTable)->whereIn('id', $ids)->get($columns)->keyBy('id')->map(fn ($row) => $this->normalize($row))->all();

            foreach ($rows as &$row) {
                $fk = $row[$foreignKey] ?? null;
                $row[$key] = $fk !== null ? ($related[$fk] ?? null) : null;
            }
            unset($row);
        }

        return $rows;
    }

    // site_settings-এ কিছু key (যেমন OpenAI API key) গোপন — এগুলোর আসল মান কখনো
    // ফ্রন্টএন্ডে পাঠানো হয় না। সেট করা থাকলে "***" (মানে: সেভ করা আছে), নাহলে ফাঁকা।
    private array $sensitiveSettings = ['openai_api_key'];

    private function maskSensitive(string $table, array $rows): array
    {
        if ($table !== 'site_settings') {
            return $rows;
        }

        foreach ($rows as &$row) {
            if (isset($row['key']) && in_array($row['key'], $this->sensitiveSettings, true)) {
                $row['value'] = ! empty($row['value']) ? '***' : '';
            }
        }
        unset($row);

        return $rows;
    }

    private function columns(string $table, string $select): array
    {
        if ($select === '*' || str_contains($select, '(') || str_contains($select, '*')) {
            return ['*'];
        }

        return array_values(array_filter(array_map('trim', explode(',', $select))));
    }

    private function rows(mixed $values): array
    {
        if (!is_array($values)) {
            return [];
        }

        return array_is_list($values) ? $values : [$values];
    }

    private function filterColumns(string $table, array $row): array
    {
        $columns = Schema::getColumnListing($table);

        $row = array_intersect_key($row, array_flip($columns));
        foreach (['images', 'items', 'courier_response'] as $jsonColumn) {
            if (array_key_exists($jsonColumn, $row) && is_array($row[$jsonColumn])) {
                $row[$jsonColumn] = json_encode($row[$jsonColumn]);
            }
        }

        return $row;
    }

    private function normalize(object $row): array
    {
        $data = (array) $row;
        foreach ($data as $key => $value) {
            if (is_string($value) && in_array($key, ['images', 'items', 'courier_response'], true)) {
                $data[$key] = json_decode($value, true) ?: [];
            }
        }

        return $data;
    }
}
