<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'original_ticket_id',
        'ticket_id',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'internal_notes',
        'assigned_to_role',
        'attachment_path',
        'user_id',
        'claimed_programmer_id',
        'reporter_name',
        'reporter_contact',
        'contact_method',
        'contact_method_notes',
        'archived_by',
        'archived_at',
        'archive_reason',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    public function originalTicket()
    {
        return $this->belongsTo(Ticket::class, 'original_ticket_id')->withTrashed();
    }

    public function archivedBy()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
