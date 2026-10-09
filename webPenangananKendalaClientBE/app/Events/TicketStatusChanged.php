<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Foundation\Events\Dispatchable;

class TicketStatusChanged
{
    use Dispatchable;

    public function __construct(
        public Ticket $ticket,
        public ?string $oldStatus,
        public string $newStatus,
        public int $triggeredByUserId
    ) {}
}
