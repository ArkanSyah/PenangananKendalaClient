<?php

namespace Tests\Unit;

use App\Models\Ticket;
use App\Models\TicketAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_role_helper(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->assertTrue($admin->hasRole('admin'));
        $this->assertFalse($admin->hasRole('programmer'));
    }

    public function test_user_has_any_role_helper(): void
    {
        $pm = User::factory()->create(['role' => 'project_manager']);
        $this->assertTrue($pm->hasAnyRole(['project_manager', 'admin']));
        $this->assertFalse($pm->hasAnyRole(['client', 'programmer']));
    }

    public function test_user_has_many_created_tickets(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        Ticket::create([
            'title' => 'Tiket A',
            'description' => 'Desc A',
            'status' => 'open',
            'user_id' => $client->id,
        ]);
        Ticket::create([
            'title' => 'Tiket B',
            'description' => 'Desc B',
            'status' => 'open',
            'user_id' => $client->id,
        ]);

        $this->assertCount(2, $client->createdTickets);
    }

    public function test_user_has_pm_and_programmer_assignments_relations(): void
    {
        $pm = User::factory()->create(['role' => 'project_manager']);
        $programmer = User::factory()->create(['role' => 'programmer']);
        $client = User::factory()->create(['role' => 'client']);

        $ticket = Ticket::create([
            'title' => 'Tiket Testing Assignment',
            'description' => 'Desc',
            'status' => 'assigned',
            'user_id' => $client->id,
        ]);

        TicketAssignment::create([
            'ticket_id' => $ticket->id,
            'pm_id' => $pm->id,
            'programmer_id' => $programmer->id,
            'assigned_at' => now(),
            'estimated_hours' => 4,
        ]);

        $this->assertCount(1, $pm->pmAssignments);
        $this->assertCount(1, $programmer->programmerAssignments);
        $this->assertEquals($ticket->id, $pm->pmAssignments->first()->ticket_id);
    }
}
