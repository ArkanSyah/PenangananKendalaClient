<?php

namespace App\Jobs;

use App\Models\NotificationBatch;
use App\Services\Notification\NotificationDispatcher;
use App\Services\Notification\NotificationRecipientResolver;
use App\Services\Notification\NotificationRenderer;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationBatch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $batchId) {}

    public function handle(
        NotificationRecipientResolver $resolver,
        NotificationRenderer $renderer,
        NotificationDispatcher $dispatcher
    ): void {
        $batch = NotificationBatch::find($this->batchId);
        if (! $batch || $batch->status !== 'pending') {
            return;
        }

        $window = (int) config('notification.debounce_seconds', 10);
        $earliestSend = $batch->last_event_at->copy()->addSeconds($window);

        if (Carbon::now()->lt($earliestSend)) {
            return;
        }

        $ticket = $batch->ticket;
        if (! $ticket) {
            $batch->update(['status' => 'skipped']);
            return;
        }

        $recipients = $resolver->resolve($ticket, $batch->status_to, $batch->triggered_by_user_id);
        $dispatcher->dispatch($recipients, $ticket, $batch, $renderer);

        $batch->update(['status' => 'sent']);
    }
}
