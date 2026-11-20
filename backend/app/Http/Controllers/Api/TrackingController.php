<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TrackingController extends Controller
{
    /**
     * Server-side tracking endpoint
     * Receives events from frontend and sends to Facebook CAPI, GA4 MP, Google Ads, TikTok
     */
    public function track(Request $request): JsonResponse
    {
        $eventName = $request->input('event_name');
        $eventData = $request->input('event_data', []);
        $platform = $request->input('platform', 'web');
        $source = $request->input('source');
        $pageUrl = $request->input('page_url');
        $referrerUrl = $request->input('referrer_url');

        if (!$eventName) {
            return response()->json(['error' => 'event_name is required'], 400);
        }

        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        // 1. Log event to database
        DB::table('tracking_events_log')->insert([
            'id' => (string) Str::uuid(),
            'event_name' => $eventName,
            'event_data' => json_encode($eventData),
            'platform' => $platform,
            'source' => $source,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'page_url' => $pageUrl,
            'referrer_url' => $referrerUrl,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Get tracking settings
        $settings = DB::table('site_settings')
            ->whereIn('key', [
                'facebook_pixel',
                'facebook_capi_token',
                'google_analytics',
                'google_ads',
                'google_ads_conversion_label',
                'tiktok_pixel',
                'tiktok_access_token',
            ])
            ->pluck('value', 'key')
            ->toArray();

        // 3. Send to platforms (fire and forget)
        $this->sendToPlatforms($eventName, $eventData, $settings, $ipAddress, $userAgent);

        return response()->json(['success' => true]);
    }

    private function sendToPlatforms(
        string $eventName,
        array $eventData,
        array $settings,
        string $clientIp,
        string $clientUserAgent
    ): void {
        $promises = [];

        // Facebook CAPI
        if (!empty($settings['facebook_pixel']) && !empty($settings['facebook_capi_token'])) {
            $this->sendFacebookCAPI($eventName, $eventData, $settings, $clientIp, $clientUserAgent);
        }

        // GA4 Measurement Protocol
        if (!empty($settings['google_analytics'])) {
            $this->sendGA4MP($eventName, $eventData, $settings, $clientIp, $clientUserAgent);
        }

        // Google Ads
        if (!empty($settings['google_ads']) && !empty($settings['google_ads_conversion_label'])) {
            $this->sendGoogleAds($eventName, $eventData, $settings);
        }

        // TikTok Server-side
        if (!empty($settings['tiktok_pixel']) && !empty($settings['tiktok_access_token'])) {
            $this->sendTikTokEvent($eventName, $eventData, $settings, $clientIp, $clientUserAgent);
        }
    }

    private function sendFacebookCAPI(
        string $eventName,
        array $eventData,
        array $settings,
        string $clientIp,
        string $clientUserAgent
    ): void {
        $pixelId = $settings['facebook_pixel'];
        $accessToken = $settings['facebook_capi_token'];

        $eventMap = [
            'PageView' => 'PageView',
            'ViewContent' => 'ViewContent',
            'AddToCart' => 'AddToCart',
            'InitiateCheckout' => 'InitiateCheckout',
            'Purchase' => 'Purchase',
            'CompletePayment' => 'Purchase',
            'Search' => 'Search',
            'AddPaymentInfo' => 'AddPaymentInfo',
        ];

        $fbEventName = $eventMap[$eventName] ?? $eventName;

        $payload = [
            'data' => [
                [
                    'event_name' => $fbEventName,
                    'event_time' => time(),
                    'event_source_url' => $eventData['page_url'] ?? '',
                    'action_source' => 'website',
                    'user_data' => [
                        'client_ip_address' => $clientIp,
                        'client_user_agent' => $clientUserAgent,
                    ],
                    'custom_data' => array_merge($eventData, [
                        'currency' => $eventData['currency'] ?? 'BDT',
                    ]),
                ],
            ],
        ];

        // Add PII if available
        if (!empty($eventData['email'])) {
            $payload['data'][0]['user_data']['em'] = [hash('sha256', $eventData['email'])];
        }
        if (!empty($eventData['phone'])) {
            $payload['data'][0]['user_data']['ph'] = [hash('sha256', $eventData['phone'])];
        }

        $url = "https://graph.facebook.com/v18.0/{$pixelId}/events?access_token={$accessToken}";

        try {
            Http::timeout(5)->post($url, $payload);
        } catch (\Exception $e) {
            // Silently fail
        }
    }

    private function sendGA4MP(
        string $eventName,
        array $eventData,
        array $settings,
        string $clientIp,
        string $clientUserAgent
    ): void {
        $measurementId = $settings['google_analytics'];
        $apiSecret = $settings['google_ads'] ?? ''; // Reuse google_ads for GA4 MP secret
        $clientId = $eventData['client_id'] ?? 'organic-' . time();

        if (empty($apiSecret)) return;

        $eventMap = [
            'PageView' => 'page_view',
            'ViewContent' => 'view_item',
            'AddToCart' => 'add_to_cart',
            'InitiateCheckout' => 'begin_checkout',
            'Purchase' => 'purchase',
            'Search' => 'search',
            'AddPaymentInfo' => 'add_payment_info',
        ];

        $ga4EventName = $eventMap[$eventName] ?? strtolower($eventName);

        $payload = [
            'client_id' => $clientId,
            'events' => [
                [
                    'name' => $ga4EventName,
                    'params' => array_merge($eventData, [
                        'currency' => $eventData['currency'] ?? 'BDT',
                        'page_title' => $eventData['page_title'] ?? '',
                        'page_location' => $eventData['page_url'] ?? '',
                    ]),
                ],
            ],
        ];

        $url = "https://www.google-analytics.com/mp/collect?measurement_id={$measurementId}&api_secret={$apiSecret}";

        try {
            Http::timeout(5)->post($url, $payload);
        } catch (\Exception $e) {
            // Silently fail
        }
    }

    private function sendGoogleAds(
        string $eventName,
        array $eventData,
        array $settings
    ): void {
        // Only send on Purchase
        if (!in_array($eventName, ['Purchase', 'CompletePayment'])) return;

        $conversionId = $settings['google_ads'];
        $conversionLabel = $settings['google_ads_conversion_label'];
        $value = $eventData['value'] ?? 0;
        $currency = $eventData['currency'] ?? 'BDT';

        $conversionUrl = "https://www.googleadservices.com/pagead/conversion/{$conversionId}/?label={$conversionLabel}&value={$value}&currency_code={$currency}&random=" . mt_rand();

        try {
            Http::timeout(3)->get($conversionUrl);
        } catch (\Exception $e) {
            // Silently fail
        }
    }

    private function sendTikTokEvent(
        string $eventName,
        array $eventData,
        array $settings,
        string $clientIp,
        string $clientUserAgent
    ): void {
        $pixelCode = $settings['tiktok_pixel'];
        $accessToken = $settings['tiktok_access_token'];

        $eventMap = [
            'PageView' => 'PageView',
            'ViewContent' => 'ViewContent',
            'AddToCart' => 'AddToCart',
            'InitiateCheckout' => 'InitiateCheckout',
            'Purchase' => 'CompletePayment',
            'CompletePayment' => 'CompletePayment',
            'Search' => 'Search',
            'AddPaymentInfo' => 'AddPaymentInfo',
        ];

        $tkEventName = $eventMap[$eventName] ?? $eventName;

        $payload = [
            'pixel_code' => $pixelCode,
            'event' => $tkEventName,
            'timestamp' => now()->toIso8601String(),
            'context' => [
                'ip' => $clientIp,
                'user_agent' => $clientUserAgent,
                'page' => [
                    'url' => $eventData['page_url'] ?? '',
                ],
            ],
            'properties' => array_merge($eventData, [
                'currency' => $eventData['currency'] ?? 'BDT',
            ]),
        ];

        try {
            Http::timeout(5)->withHeaders([
                'Access-Token' => $accessToken,
            ])->post('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', $payload);
        } catch (\Exception $e) {
            // Silently fail
        }
    }
}