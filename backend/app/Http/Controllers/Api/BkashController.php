<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BkashSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * bKash Tokenized Checkout (https://developer.bka.sh)
 *
 * Flow: grant token -> create payment (redirect user to bkashURL)
 *       -> bKash redirects back to callback with paymentID
 *       -> execute payment -> mark order paid.
 */
class BkashController extends Controller
{
    /** Get current settings for the admin panel (secrets masked). */
    public function show(): JsonResponse
    {
        $settings = BkashSetting::first();

        if (! $settings) {
            return response()->json(['ok' => true, 'data' => null]);
        }

        return response()->json([
            'ok' => true,
            'data' => [
                'app_key' => $settings->app_key,
                'app_secret' => $settings->app_secret ? '********' : '',
                'username' => $settings->username,
                'password' => $settings->password ? '********' : '',
                'mode' => $settings->mode,
                'is_active' => $settings->is_active,
            ],
        ]);
    }

    /** Save settings from the admin panel. Masked values keep the stored secret. */
    public function save(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'app_key' => 'nullable|string',
            'app_secret' => 'nullable|string',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'mode' => 'required|string|in:sandbox,live',
            'is_active' => 'boolean',
        ]);

        foreach (['app_secret', 'password'] as $secret) {
            if (($validated[$secret] ?? '') === '********') {
                unset($validated[$secret]);
            }
        }

        $settings = BkashSetting::first();
        if ($settings) {
            $settings->update($validated);
        } else {
            $settings = BkashSetting::create($validated);
        }

        Cache::forget('bkash_id_token');

        return response()->json(['ok' => true, 'message' => 'বিকাশ সেটিংস সংরক্ষণ করা হয়েছে']);
    }

    /** Create a bKash payment for an order and return the redirect URL. */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'callback_url' => 'required|url',
        ]);

        $settings = BkashSetting::getActive();
        if (! $settings || ! $settings->app_key) {
            return response()->json(['ok' => false, 'message' => 'বিকাশ লাইভ পেমেন্ট কনফিগার করা নেই'], 400);
        }

        $order = DB::table('orders')->where('id', $validated['order_id'])->first();
        if (! $order) {
            return response()->json(['ok' => false, 'message' => 'অর্ডার পাওয়া যায়নি'], 404);
        }
        if ($order->payment_status === 'paid') {
            return response()->json(['ok' => false, 'message' => 'এই অর্ডারের পেমেন্ট আগেই সম্পন্ন হয়েছে'], 400);
        }

        try {
            $token = $this->grantToken($settings);

            $response = Http::withHeaders([
                'Authorization' => $token,
                'X-APP-Key' => $settings->app_key,
                'Accept' => 'application/json',
            ])->post($settings->baseUrl().'/tokenized/checkout/create', [
                'mode' => '0011',
                'payerReference' => $order->customer_phone ?: '01',
                'callbackURL' => $validated['callback_url'],
                'amount' => number_format((float) $order->total, 2, '.', ''),
                'currency' => 'BDT',
                'intent' => 'sale',
                'merchantInvoiceNumber' => $order->order_number,
            ]);

            $data = $response->json() ?? [];

            if (($data['statusCode'] ?? '') !== '0000' || empty($data['bkashURL'])) {
                Log::warning('bKash create failed', ['order' => $order->order_number, 'response' => $data]);

                return response()->json([
                    'ok' => false,
                    'message' => $data['statusMessage'] ?? 'বিকাশ পেমেন্ট শুরু করা যায়নি',
                ], 502);
            }

            DB::table('orders')->where('id', $order->id)->update(['bkash_payment_id' => $data['paymentID']]);

            return response()->json(['ok' => true, 'bkashURL' => $data['bkashURL'], 'paymentID' => $data['paymentID']]);
        } catch (\Exception $e) {
            Log::error('bKash create exception', ['error' => $e->getMessage()]);

            return response()->json(['ok' => false, 'message' => 'বিকাশ সার্ভারে সংযোগ করা যায়নি'], 502);
        }
    }

    /** Execute the payment after bKash redirects back with status=success. */
    public function execute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => 'required|string',
        ]);

        $settings = BkashSetting::getActive();
        if (! $settings) {
            return response()->json(['ok' => false, 'message' => 'বিকাশ লাইভ পেমেন্ট কনফিগার করা নেই'], 400);
        }

        $order = DB::table('orders')->where('bkash_payment_id', $validated['payment_id'])->first();
        if (! $order) {
            return response()->json(['ok' => false, 'message' => 'অর্ডার পাওয়া যায়নি'], 404);
        }
        if ($order->payment_status === 'paid') {
            return response()->json(['ok' => true, 'order_number' => $order->order_number, 'trx_id' => $order->payment_transaction_id]);
        }

        try {
            $token = $this->grantToken($settings);

            $response = Http::withHeaders([
                'Authorization' => $token,
                'X-APP-Key' => $settings->app_key,
                'Accept' => 'application/json',
            ])->post($settings->baseUrl().'/tokenized/checkout/execute', [
                'paymentID' => $validated['payment_id'],
            ]);

            $data = $response->json() ?? [];

            // Execute can time out after the money already moved — fall back to the status query.
            if (($data['statusCode'] ?? '') !== '0000') {
                $data = $this->queryStatus($settings, $token, $validated['payment_id']);
            }

            $completed = ($data['statusCode'] ?? '') === '0000'
                && ($data['transactionStatus'] ?? '') === 'Completed';

            if (! $completed) {
                Log::warning('bKash execute failed', ['paymentID' => $validated['payment_id'], 'response' => $data]);

                return response()->json([
                    'ok' => false,
                    'message' => $data['statusMessage'] ?? 'পেমেন্ট সম্পন্ন হয়নি',
                ], 402);
            }

            DB::table('orders')->where('id', $order->id)->update([
                'payment_status' => 'paid',
                'payment_transaction_id' => $data['trxID'] ?? null,
                'payment_sender_number' => $data['customerMsisdn'] ?? null,
                'updated_at' => now(),
            ]);

            return response()->json(['ok' => true, 'order_number' => $order->order_number, 'trx_id' => $data['trxID'] ?? null]);
        } catch (\Exception $e) {
            Log::error('bKash execute exception', ['error' => $e->getMessage()]);

            return response()->json(['ok' => false, 'message' => 'বিকাশ সার্ভারে সংযোগ করা যায়নি'], 502);
        }
    }

    /** Grant (and cache) an id_token. bKash tokens expire in 1 hour. */
    private function grantToken(BkashSetting $settings): string
    {
        return Cache::remember('bkash_id_token', now()->addMinutes(50), function () use ($settings) {
            $response = Http::withHeaders([
                'username' => $settings->username,
                'password' => $settings->password,
                'Accept' => 'application/json',
            ])->post($settings->baseUrl().'/tokenized/checkout/token/grant', [
                'app_key' => $settings->app_key,
                'app_secret' => $settings->app_secret,
            ]);

            $data = $response->json() ?? [];

            if (empty($data['id_token'])) {
                throw new \RuntimeException('bKash token grant failed: '.($data['statusMessage'] ?? $response->status()));
            }

            return $data['id_token'];
        });
    }

    private function queryStatus(BkashSetting $settings, string $token, string $paymentId): array
    {
        $response = Http::withHeaders([
            'Authorization' => $token,
            'X-APP-Key' => $settings->app_key,
            'Accept' => 'application/json',
        ])->post($settings->baseUrl().'/tokenized/checkout/payment/status', [
            'paymentID' => $paymentId,
        ]);

        return $response->json() ?? [];
    }
}
