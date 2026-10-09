<?php

namespace Tests\Unit;

use App\Models\NotificationBatch;
use App\Models\NotificationHold;
use App\Models\NotificationLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_hold_belongs_to_recipient_and_batch(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::create([
            'title' => 'Tiket Notif Hold',
            'description' => 'Desc',
            'status' => 'open',
            'user_id' => $user->id,
        ]);

        $batch = NotificationBatch::create([
            'ticket_id' => $ticket->id,
            'status_from' => 'open',
            'status_to' => 'in_progress',
            'event_chain' => ['open', 'in_progress'],
            'triggered_by_user_id' => $user->id,
            'first_event_at' => now(),
            'last_event_at' => now(),
            'expires_at' => now()->addMinutes(15),
            'status' => 'pending',
        ]);

        $hold = NotificationHold::create([
            'recipient_user_id' => $user->id,
            'batch_id' => $batch->id,
            'scheduled_release_at' => now()->addHours(2),
            'status' => 'pending',
        ]);

        $this->assertInstanceOf(User::class, $hold->recipient);
        $this->assertInstanceOf(NotificationBatch::class, $hold->batch);
        $this->assertEquals($user->id, $hold->recipient->id);
        $this->assertEquals($batch->id, $hold->batch->id);
        $this->assertEquals('pending', $hold->status);
    }

    public function test_notification_log_belongs_to_recipient(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::create([
            'title' => 'Tiket Notif Log',
            'description' => 'Desc',
            'status' => 'open',
            'user_id' => $user->id,
        ]);

        $log = NotificationLog::create([
            'ticket_id' => $ticket->id,
            'recipient_user_id' => $user->id,
            'channel' => 'in_app',
            'message' => 'Status tiket diperbarui menjadi In Progress',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $this->assertInstanceOf(User::class, $log->recipient);
        $this->assertEquals($user->id, $log->recipient->id);
        $this->assertEquals('sent', $log->status);
        $this->assertEquals('in_app', $log->channel);
    }
}
