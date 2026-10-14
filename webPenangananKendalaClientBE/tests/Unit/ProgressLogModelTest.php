<?php

namespace Tests\Unit;

use App\Models\ProgressLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressLogModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_progress_log_belongs_to_ticket_and_user(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::create([
            'title' => 'Tiket Uji Log',
            'description' => 'Desc',
            'status' => 'open',
            'user_id' => $user->id,
        ]);

        $log = ProgressLog::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'previous_status' => 'pending_confirmation',
            'new_status' => 'open',
            'notes' => 'Tiket telah dikonfirmasi.',
            'is_internal' => false,
        ]);

        $this->assertInstanceOf(Ticket::class, $log->ticket);
        $this->assertInstanceOf(User::class, $log->user);
        $this->assertEquals($ticket->id, $log->ticket->id);
        $this->assertEquals($user->id, $log->user->id);
    }

    public function test_progress_log_is_internal_boolean_cast(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::create([
            'title' => 'Tiket Uji Log 2',
            'description' => 'Desc',
            'status' => 'open',
            'user_id' => $user->id,
        ]);

        $log = ProgressLog::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'previous_status' => 'open',
            'new_status' => 'in_progress',
            'notes' => 'Catatan internal programmer.',
            'is_internal' => 1,
        ]);

        $this->assertIsBool($log->is_internal);
        $this->assertTrue($log->is_internal);
    }
}
