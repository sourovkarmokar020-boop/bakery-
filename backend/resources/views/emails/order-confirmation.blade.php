<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>অর্ডার কনফার্মেশন</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2d6a4f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .order-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .order-info h3 { margin: 0 0 10px; color: #2d6a4f; }
        .order-info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2d6a4f; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; font-size: 16px; }
        .total-row td { border-top: 2px solid #2d6a4f; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .btn { display: inline-block; padding: 12px 24px; background: #2d6a4f; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>অর্ডার কনফার্মেশন</h1>
            <p>আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে</p>
        </div>
        <div class="content">
            <div class="order-info">
                <h3>অর্ডার #{{ $order['order_id'] }}</h3>
                <p><strong>নাম:</strong> {{ $order['customer_name'] ?? $order['name'] ?? '' }}</p>
                <p><strong>ইমেইল:</strong> {{ $order['customer_email'] ?? $order['email'] ?? '' }}</p>
                <p><strong>ফোন:</strong> {{ $order['customer_phone'] ?? $order['phone'] ?? '' }}</p>
                <p><strong>ঠিকানা:</strong> {{ $order['customer_address'] ?? $order['address'] ?? '' }}</p>
                <p><strong>অর্ডারের তারিখ:</strong> {{ $order['created_at'] ?? date('Y-m-d H:i:s') }}</p>
                <p><strong>পেমেন্ট স্ট্যাটাস:</strong> {{ $order['payment_status'] ?? 'pending' }}</p>
            </div>

            <h3>অর্ডারকৃত পণ্যসমূহ</h3>
            <table>
                <thead>
                    <tr>
                        <th>পণ্য</th>
                        <th>পরিমাণ</th>
                        <th>মূল্য</th>
                        <th>মোট</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($cartItems as $item)
                    <tr>
                        <td>{{ $item['name'] ?? $item['product_name'] ?? 'পণ্য' }}</td>
                        <td>{{ $item['quantity'] ?? 1 }}</td>
                        <td>৳{{ number_format($item['price'] ?? 0, 2) }}</td>
                        <td>৳{{ number_format(($item['price'] ?? 0) * ($item['quantity'] ?? 1), 2) }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right;">মোট:</td>
                        <td>৳{{ number_format($order['total'] ?? $order['total_amount'] ?? 0, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <p style="text-align: center;">
                আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
            </p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Dream Mart. All rights reserved.</p>
            <p>এই ইমেইলটি স্বয়ংক্রিয়ভাবে তৈরি, অনুগ্রহ করে এর উত্তর দিবেন না।</p>
        </div>
    </div>
</body>
</html>