<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmtpSetting extends Model
{
    protected $table = 'smtp_settings';

    protected $fillable = [
        'mailer',
        'host',
        'port',
        'username',
        'password',
        'encryption',
        'from_address',
        'from_name',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'port' => 'integer',
    ];

    /**
     * Get the active SMTP settings.
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }
}