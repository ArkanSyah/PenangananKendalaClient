<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketEditTitleTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        return User::factory()->create(['role' => $role, 'is_active' => true]);
    }

    private function createTicket(User $creator): Ticket
    {
        return Ticket::create([
            'title' => 'Original Title',
            'description' => 'Desc',
            'status' => 'open',
            'user_id' => $creator->id,
        ]);
    }

    public function test_owner_can_edit_title(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);

        $response = $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", [
            'title' => 'New Title',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'title' => 'New Title',
        ]);
        $this->assertDatabaseHas('progress_logs', [
            'ticket_id' => $ticket->id,
            'user_id' => $owner->id,
        ]);
    }

    public function test_admin_can_edit_title(): void
    {
        $admin = $this->createUser('admin');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", [
            'title' => 'Admin Edited',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'title' => 'Admin Edited',
        ]);
    }

    public function test_project_manager_cannot_edit_title(): void
    {
        $pm = $this->createUser('project_manager');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($pm);

        $response = $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", [
            'title' => 'Should Fail',
        ]);

        $response->assertStatus(403);
    }

    public function test_programmer_cannot_edit_title(): void
    {
        $prog = $this->createUser('programmer');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($prog);

        $response = $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", [
            'title' => 'Should Fail',
        ]);

        $response->assertStatus(403);
    }

    public function test_title_is_required(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);

        $response = $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    public function test_title_max_length_255(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);

        $response = $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", [
            'title' => str_repeat('A', 256),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }

    public function test_cannot_edit_nonexistent_ticket(): void
    {
        $owner = $this->createUser('owner');

        Sanctum::actingAs($owner);

        $response = $this->patchJson('/api/tickets/TCK-999999-9999/title', [
            'title' => 'New',
        ]);

        $response->assertStatus(404);
    }

    public function test_no_log_when_title_unchanged(): void
    {
        $owner = $this->createUser('owner');
        $creator = $this->createUser('service_desk');
        $ticket = $this->createTicket($creator);

        Sanctum::actingAs($owner);

        $this->patchJson("/api/tickets/{$ticket->ticket_id}/title", [
            'title' => 'Original Title',
        ]);

        $this->assertDatabaseMissing('progress_logs', [
            'ticket_id' => $ticket->id,
            'notes' => 'like',
            '%[TITLE_EDIT]%',
        ]);
    }
}
