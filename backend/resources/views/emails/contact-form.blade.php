<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>কন্টাক্ট ফর্ম</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2d6a4f; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .field label { font-weight: bold; color: #2d6a4f; display: block; margin-bottom: 5px; }
        .field p { margin: 0; }
        .message-box { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>নতুন কন্টাক্ট ফর্ম সাবমিশন</h1>
            <p>Dream Mart</p>
        </div>
        <div class="content">
            <div class="field">
                <label>নাম:</label>
                <p>{{ $data['name'] ?? '' }}</p>
            </div>
            <div class="field">
                <label>ইমেইল:</label>
                <p>{{ $data['email'] ?? '' }}</p>
            </div>
            @if(isset($data['phone']))
            <div class="field">
                <label>ফোন:</label>
                <p>{{ $data['phone'] }}</p>
            </div>
            @endif
            <div class="field">
                <label>বিষয়:</label>
                <p>{{ $data['subject'] ?? 'কোনো বিষয় উল্লেখ নেই' }}</p>
            </div>
            <div class="message-box">
                <label style="font-weight: bold; color: #2d6a4f; display: block; margin-bottom: 10px;">বার্তা:</label>
                <p>{{ $data['message'] ?? '' }}</p>
            </div>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Dream Mart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>