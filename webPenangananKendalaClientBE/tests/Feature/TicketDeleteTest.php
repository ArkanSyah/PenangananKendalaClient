<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketDeleteTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        return User::factory()->create(['role' => $role, 'is_active' => true]);
    }

    private function createTicket(User $creator): Ticket
    {
        return Ticket::create([
            'title' => 'Test Ticket Delete',
            'description' => 'For delete test',
            'status' => 'open',
            'user_id' => $creator->id,
        ]);
    }

    public function test_owner_can_delete_ticket(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);

        $response = $this->deleteJson("/api/tickets/{$ticket->ticket_id}", [
            'reason' => 'Duplicate ticket',
        ]);

        $response->assertStatus(200);
        $this->assertSoftDeleted('tickets', ['id' => $ticket->id]);
        $this->assertDatabaseHas('archived_tickets', [
            'original_ticket_id' => $ticket->id,
            'archived_by' => $owner->id,
        ]);
        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $owner->id,
            'action' => 'delete_ticket',
        ]);
    }

    public function test_admin_can_delete_ticket(): void
    {
        $admin = $this->createUser('admin');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/tickets/{$ticket->ticket_id}");
        $response->assertStatus(200);
    }

    public function test_project_manager_cannot_delete_ticket(): void
    {
        $pm = $this->createUser('project_manager');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($pm);

        $response = $this->deleteJson("/api/tickets/{$ticket->ticket_id}");
        $response->assertStatus(403);
    }

    public function test_programmer_cannot_delete_ticket(): void
    {
        $prog = $this->createUser('programmer');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($prog);

        $response = $this->deleteJson("/api/tickets/{$ticket->ticket_id}");
        $response->assertStatus(403);
    }

    public function test_owner_can_restore_ticket(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);
        $this->deleteJson("/api/tickets/{$ticket->ticket_id}");

        $response = $this->postJson("/api/tickets/{$ticket->ticket_id}/restore");

        $response->assertStatus(200);
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'deleted_at' => null,
        ]);
        $this->assertDatabaseHas('admin_activity_logs', [
            'admin_id' => $owner->id,
            'action' => 'restore_ticket',
        ]);
    }

    public function test_owner_can_list_archived_tickets(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);
        $this->deleteJson("/api/tickets/{$ticket->ticket_id}");

        $response = $this->getJson('/api/archived-tickets');
        $response->assertStatus(200);
        $response->assertJsonFragment(['ticket_id' => $ticket->ticket_id]);
    }

    public function test_non_executive_cannot_list_archived_tickets(): void
    {
        $pm = $this->createUser('project_manager');
        Sanctum::actingAs($pm);

        $response = $this->getJson('/api/archived-tickets');
        $response->assertStatus(403);
    }
}
