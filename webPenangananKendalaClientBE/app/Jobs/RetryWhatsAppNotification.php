<?php

namespace App\Jobs;

use App\Models\NotificationBatch;
use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Notification\Channels\EmailChannel;
use App\Services\Notification\Channels\WhatsAppChannel;
use App\Services\Notification\NotificationRenderer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RetryWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(
        public int $logId,
        public int $userId,
        public int $ticketId,
        public int $batchId,
        public string $message,
    ) {}

    public function handle(
        WhatsAppChannel $wa,
        EmailChannel $email,
        NotificationRenderer $renderer,
    ): void {
        $log = NotificationLog::find($this->logId);
        $user = User::find($this->userId);
        $ticket = Ticket::find($this->ticketId);
        $batch = NotificationBatch::find($this->batchId);
        $pref = NotificationPreference::find($this->userId);

        if (! $log || ! $user || ! $ticket || ! $batch || ! $pref) {
            return;
        }

        $attempts = $log->channel_attempts ?? [];

        $res = $wa->send($pref->phone, $this->message);

        $attempts[] = ['attempt' => 2, 'channel' => 'wa', 'result' => $res];

        if ($res['success']) {
            $log->update([
                'status' => 'sent',
                'reason' => null,
                'channel_attempts' => $attempts,
                'sent_at' => now(),
            ]);
            return;
        }

        $log->update([
            'status' => 'failed',
            'reason' => $res['reason'] ?? 'retry_failed',
            'channel_attempts' => $attempts,
        ]);

        if (! $pref->email_enabled || ! $pref->email_fallback) {
            return;
        }

        $emailMsg = $renderer->render($user, $ticket, $batch, 'email');
        $emailRes = $email->send(
            $pref->email_fallback,
            'Update Tiket ' . $ticket->ticket_id,
            $emailMsg,
        );

        NotificationLog::create([
            'batch_id' => $batch->id,
            'ticket_id' => $ticket->id,
            'recipient_user_id' => $user->id,
            'channel' => 'email',
            'message' => $emailMsg,
            'status' => $emailRes['success'] ? 'sent' : 'failed',
            'reason' => $emailRes['success'] ? null : ($emailRes['reason'] ?? 'unknown'),
            'channel_attempts' => [['attempt' => 1, 'channel' => 'email', 'result' => $emailRes]],
            'sent_at' => $emailRes['success'] ? now() : null,
        ]);
    }
}
