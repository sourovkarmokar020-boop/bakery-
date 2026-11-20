<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SteadfastCourierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class SteadfastCourierController extends Controller
{
    public function __construct(private readonly SteadfastCourierService $steadfast)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $this->ensurePanelAdmin($request);

        return response()->json(['data' => $this->steadfast->settings()]);
    }

    public function save(Request $request): JsonResponse
    {
        $this->ensurePanelAdmin($request);

        $data = $request->validate([
            'enabled' => ['nullable', 'boolean'],
            'api_key' => ['nullable', 'string'],
            'secret_key' => ['nullable', 'string'],
            'base_url' => ['nullable', 'url'],
        ]);

        try {
            return response()->json(['data' => $this->steadfast->save($data)]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function balance(Request $request): JsonResponse
    {
        $this->ensurePanelAdmin($request);

        try {
            $balance = $this->steadfast->currentBalance();

            return response()->json(['data' => [
                'current_balance' => $balance['current_balance'] ?? null,
                'raw' => $balance,
                'settings' => $this->steadfast->settings(),
            ]]);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function sendOrder(Request $request, string $order): JsonResponse
    {
        $this->ensurePanelAdmin($request);

        $orderRow = DB::table('orders')->where('id', $order)->first();
        if (!$orderRow) {
            return response()->json(['message' => 'অর্ডার পাওয়া যায়নি।'], 404);
        }

        if ($orderRow->courier_tracking_code || $orderRow->courier_consignment_id) {
            return response()->json(['message' => 'এই অর্ডারটি আগে থেকেই Steadfast-এ পাঠানো হয়েছে।'], 422);
        }

        try {
            $payload = $this->orderPayload($orderRow);
            $response = $this->steadfast->createOrder($payload);
            $consignment = $response['consignment'] ?? $response;
            $trackingCode = $consignment['tracking_code'] ?? $response['tracking_code'] ?? null;
            $consignmentId = $consignment['consignment_id'] ?? $response['consignment_id'] ?? null;

            if (!$trackingCode && !$consignmentId) {
                throw new RuntimeException($response['message'] ?? 'Steadfast order response invalid.');
            }

            $statusId = $this->inCourierStatusId();
            DB::table('orders')->where('id', $order)->update([
                'status_id' => $statusId,
                'courier_provider' => SteadfastCourierService::PROVIDER,
                'courier_status' => $consignment['status'] ?? 'in_review',
                'courier_tracking_code' => $trackingCode,
                'courier_consignment_id' => $consignmentId ? (string) $consignmentId : null,
                'courier_order_id' => $consignmentId ? (string) $consignmentId : null,
                'courier_sent_at' => now(),
                'courier_response' => json_encode($response),
                'updated_at' => now(),
            ]);

            $updatedOrder = DB::table('orders')->where('id', $order)->first();

            return response()->json(['data' => [
                'order' => $updatedOrder,
                'steadfast' => $response,
            ]]);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function orderPayload(object $order): array
    {
        $items = DB::table('order_items')->where('order_id', $order->id)->get();
        $phone = $this->bdPhone($order->customer_phone);
        if (!$phone) {
            throw new RuntimeException('Steadfast-এ পাঠানোর জন্য ১১ ডিজিটের ফোন নাম্বার দরকার।');
        }

        $paid = ($order->payment_status ?? '') === 'paid';
        $description = $items
            ->map(fn ($item) => "{$item->product_name} x {$item->quantity}")
            ->filter()
            ->implode(', ');

        return [
            'invoice' => (string) $order->order_number,
            'recipient_name' => Str::limit((string) $order->customer_name, 100, ''),
            'recipient_phone' => $phone,
            'recipient_address' => Str::limit(trim($order->customer_address.' '.$order->delivery_area), 250, ''),
            'cod_amount' => $paid ? 0 : (float) $order->total,
            'note' => $order->notes ?: null,
            'recipient_email' => $order->customer_email ?: null,
            'item_description' => $description ?: 'Order '.$order->order_number,
            'total_lot' => max(1, (int) $items->sum('quantity')),
            'delivery_type' => 0,
        ];
    }

    private function bdPhone(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);
        if (str_starts_with($digits, '880') && strlen($digits) === 13) {
            $digits = '0'.substr($digits, 3);
        }

        return preg_match('/^01\d{9}$/', $digits) ? $digits : null;
    }

    private function inCourierStatusId(): string
    {
        $status = DB::table('order_statuses')->where('name', 'In Courier')->first();
        if ($status) {
            return $status->id;
        }

        $id = (string) Str::uuid();
        DB::table('order_statuses')->insert([
            'id' => $id,
            'name' => 'In Courier',
            'color' => '#06b6d4',
            'sort_order' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    private function ensurePanelAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless(
            $user && DB::table('user_roles')
                ->where('user_id', (string) $user->id)
                ->whereIn('role', ['admin', 'super_admin'])
                ->exists(),
            403
        );
    }
}
