<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class VisualSearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:8192']]);

        // admin প্যানেল থেকে ফিচারটি বন্ধ রাখা যায়
        $enabled = DB::table('site_settings')->where('key', 'visual_search_enabled')->value('value');
        if ($enabled === 'false') {
            return response()->json(['message' => 'ছবি দিয়ে খোঁজার ফিচারটি এখন বন্ধ আছে'], 503);
        }

        // API key আগে admin প্যানেলের সেটিং থেকে, না থাকলে .env থেকে
        $apiKey = DB::table('site_settings')->where('key', 'openai_api_key')->value('value')
            ?: config('services.openai.api_key');
        if (! $apiKey) {
            return response()->json(['message' => 'ছবি দিয়ে খোঁজার সার্ভিস এখনো কনফিগার করা হয়নি (OpenAI API key দিন)'], 503);
        }

        $catalog = DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.is_active', true)
            ->select('products.name', 'categories.name as category_name')
            ->get();

        $catalogText = $catalog->map(
            fn ($p) => '- '.$p->name.($p->category_name ? " (ক্যাটাগরি: {$p->category_name})" : '')
        )->implode("\n");

        $image = $request->file('image');
        $imageData = base64_encode(file_get_contents($image->getRealPath()));
        $mime = $image->getMimeType();

        $prompt = <<<PROMPT
তুমি একটা Dream Mart এর প্রোডাক্ট চেনার সহকারী। ছবিটা দেখো এবং বলো এটা কী ধরনের প্রোডাক্ট।

আমাদের দোকানের বর্তমান প্রোডাক্ট তালিকা:
{$catalogText}

উপরের তালিকা থেকে ছবির সাথে সবচেয়ে বেশি মিলে এমন প্রোডাক্টের নাম বাছাই করো (সর্বোচ্চ ৫টা, তালিকায় থাকা নাম হুবহু লিখবে)। হুবহু মিল পেলে "exact", ঠিক না মিললেও কাছাকাছি ধরনের কিছু পেলে "similar" দাও। একদমই কিছু না মিললে matches খালি রাখো।

শুধু নিচের JSON ফরম্যাটে উত্তর দাও, অন্য কোনো লেখা দিও না:
{"matches": [{"name": "প্রোডাক্টের নাম (তালিকা থেকে হুবহু)", "confidence": "exact অথবা similar"}], "note": "ছবিতে কী দেখা যাচ্ছে তার এক লাইনের বাংলা বর্ণনা"}
PROMPT;

        $response = Http::withToken($apiKey)->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $prompt],
                        ['type' => 'image_url', 'image_url' => ['url' => "data:{$mime};base64,{$imageData}"]],
                    ],
                ],
            ],
            'response_format' => ['type' => 'json_object'],
            'max_tokens' => 500,
        ]);

        if ($response->failed()) {
            return response()->json(['message' => 'AI সার্ভিসে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করুন'], 502);
        }

        $parsed = json_decode((string) $response->json('choices.0.message.content'), true) ?: [];
        $matches = collect($parsed['matches'] ?? []);
        $confidenceByName = $matches->pluck('confidence', 'name');

        $matchedProducts = $matches->isEmpty() ? collect() : DB::table('products')
            ->where('is_active', true)
            ->whereIn('name', $matches->pluck('name'))
            ->get()
            ->map(function ($product) use ($confidenceByName) {
                $row = (array) $product;
                $row['confidence'] = $confidenceByName->get($product->name, 'similar') === 'exact' ? 'exact' : 'similar';

                return $row;
            })
            ->values();

        return response()->json([
            'matches' => $matchedProducts,
            'note' => $parsed['note'] ?? null,
        ]);
    }
}
