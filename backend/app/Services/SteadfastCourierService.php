<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class SteadfastCourierService
{
    public const PROVIDER = 'steadfast';
    public const DEFAULT_BASE_URL = 'https://portal.packzy.com/api/v1';

    public function settings(): array
    {
        $row = DB::table('courier_settings')->where('provider', self::PROVIDER)->first();

        if (!$row) {
            return [
                'enabled' => false,
                'base_url' => self::DEFAULT_BASE_URL,
                'api_key_present' => false,
                'secret_key_present' => false,
                'api_key_masked' => '',
                'secret_key_masked' => '',
                'connected' => false,
                'last_balance' => null,
                'last_checked_at' => null,
            ];
        }

        $apiKey = $this->decrypt($row->api_key);
        $secretKey = $this->decrypt($row->secret_key);

        return [
            'enabled' => (bool) $row->enabled,
            'base_url' => $row->base_url ?: self::DEFAULT_BASE_URL,
            'api_key_present' => filled($apiKey),
            'secret_key_present' => filled($secretKey),
            'api_key_masked' => $this->mask($apiKey),
            'secret_key_masked' => $this->mask($secretKey),
            'connected' => (bool) $row->enabled && filled($apiKey) && filled($secretKey),
            'last_balance' => $row->last_balance,
            'last_checked_at' => $row->last_checked_at,
        ];
    }

    public function save(array $payload): array
    {
        $current = DB::table('courier_settings')->where('provider', self::PROVIDER)->first();
        $apiKey = trim((string) ($payload['api_key'] ?? ''));
        $secretKey = trim((string) ($payload['secret_key'] ?? ''));
        $baseUrl = rtrim(trim((string) ($payload['base_url'] ?? '')), '/') ?: self::DEFAULT_BASE_URL;
        $enabled = (bool) ($payload['enabled'] ?? false);

        $values = [
            'enabled' => $enabled,
            'base_url' => $baseUrl,
            'updated_at' => now(),
        ];

        if ($apiKey !== '') {
            $values['api_key'] = Crypt::encryptString($apiKey);
        }

        if ($secretKey !== '') {
            $values['secret_key'] = Crypt::encryptString($secretKey);
        }

        if ($enabled) {
            $storedApiKey = $apiKey !== '' ? $apiKey : $this->decrypt($current->api_key ?? null);
            $storedSecretKey = $secretKey !== '' ? $secretKey : $this->decrypt($current->secret_key ?? null);
            if (!$storedApiKey || !$storedSecretKey) {
                throw new RuntimeException('API Key এবং Secret Key দুটোই দিতে হবে।');
            }
        }

        if ($current) {
            DB::table('courier_settings')->where('provider', self::PROVIDER)->update($values);
        } else {
            DB::table('courier_settings')->insert($values + [
                'id' => (string) Str::uuid(),
                'provider' => self::PROVIDER,
                'created_at' => now(),
            ]);
        }

        return $this->settings();
    }

    public function currentBalance(): array
    {
        $response = $this->request()->get($this->baseUrl().'/get_balance');
        $data = $this->jsonOrFail($response);

        if (!array_key_exists('current_balance', $data)) {
            throw new RuntimeException($data['message'] ?? 'Steadfast balance response invalid.');
        }

        DB::table('courier_settings')->where('provider', self::PROVIDER)->update([
            'last_balance' => (float) $data['current_balance'],
            'last_checked_at' => now(),
            'updated_at' => now(),
        ]);

        return $data;
    }

    public function createOrder(array $payload): array
    {
        $response = $this->request()->post($this->baseUrl().'/create_order', $payload);

        return $this->jsonOrFail($response);
    }

    private function request()
    {
        $apiKey = $this->credential('api_key');
        $secretKey = $this->credential('secret_key');

        if (!$apiKey || !$secretKey) {
            throw new RuntimeException('Steadfast API credentials সেট করা নেই।');
        }

        return Http::timeout(30)
            ->acceptJson()
            ->asJson()
            ->withHeaders([
                'Api-Key' => $apiKey,
                'Secret-Key' => $secretKey,
                'Content-Type' => 'application/json',
            ]);
    }

    private function baseUrl(): string
    {
        $row = DB::table('courier_settings')->where('provider', self::PROVIDER)->first();

        return rtrim($row->base_url ?? self::DEFAULT_BASE_URL, '/');
    }

    private function credential(string $column): ?string
    {
        $row = DB::table('courier_settings')->where('provider', self::PROVIDER)->first();

        if (!$row || !$row->enabled) {
            throw new RuntimeException('Steadfast courier সক্রিয় করা নেই।');
        }

        return $this->decrypt($row->{$column} ?? null);
    }

    private function jsonOrFail(Response $response): array
    {
        $data = $response->json() ?? [];

        if ($response->failed()) {
            $message = $data['message'] ?? $data['error'] ?? 'Steadfast API request failed.';
            throw new RuntimeException($message, $response->status());
        }

        return is_array($data) ? $data : [];
    }

    private function decrypt(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return $value;
        }
    }

    private function mask(?string $value): string
    {
        if (!$value) {
            return '';
        }

        $length = strlen($value);
        if ($length <= 8) {
            return str_repeat('•', $length);
        }

        return substr($value, 0, 4).str_repeat('•', max(4, $length - 8)).substr($value, -4);
    }
}
