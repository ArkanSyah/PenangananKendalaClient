<?php

namespace App\Listeners;

use App\Events\TicketStatusChanged;
use App\Services\Notification\NotificationAggregator;

class AggregateTicketStatusNotification
{
    public function __construct(private NotificationAggregator $aggregator) {}

    public function handle(TicketStatusChanged $event): void
    {
        $this->aggregator->handle(
            $event->ticket->id,
            $event->oldStatus,
            $event->newStatus,
            $event->triggeredByUserId,
        );
    }
}
