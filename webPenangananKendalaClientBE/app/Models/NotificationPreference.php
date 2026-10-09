<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'user_id', 'phone', 'email_fallback',
        'wa_enabled', 'email_enabled', 'in_app_enabled',
        'notify_assigned', 'notify_resolved', 'notify_rejected',
        'notify_escalated', 'notify_minor',
        'digest_mode', 'quiet_hours_enabled',
        'quiet_hours_start', 'quiet_hours_end', 'timezone',
    ];

    protected $casts = [
        'wa_enabled' => 'bool',
        'email_enabled' => 'bool',
        'in_app_enabled' => 'bool',
        'notify_assigned' => 'bool',
        'notify_resolved' => 'bool',
        'notify_rejected' => 'bool',
        'notify_escalated' => 'bool',
        'notify_minor' => 'bool',
        'quiet_hours_enabled' => 'bool',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
