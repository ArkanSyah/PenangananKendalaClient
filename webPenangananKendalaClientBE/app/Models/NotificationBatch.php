<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationBatch extends Model
{
    protected $fillable = [
        'ticket_id', 'status_from', 'status_to', 'event_chain',
        'triggered_by_user_id', 'first_event_at', 'last_event_at',
        'expires_at', 'status',
    ];

    protected $casts = [
        'event_chain' => 'array',
        'first_event_at' => 'datetime',
        'last_event_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class, 'batch_id');
    }
}
