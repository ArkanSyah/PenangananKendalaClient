<?php

namespace Tests\Feature;

use App\Models\ProgressLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BoardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $owner;
    private User $programmer;
    private User $client;
    private User $serviceDesk;
    private Ticket $ticket;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->owner = User::factory()->create(['role' => 'owner', 'is_active' => true]);
        $this->programmer = User::factory()->create(['role' => 'programmer', 'is_active' => true]);
        $this->client = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $this->serviceDesk = User::factory()->create(['role' => 'service_desk', 'is_active' => true]);

        $this->ticket = Ticket::create([
            'title' => 'Kendala Jaringan Cabang',
            'description' => 'Koneksi internet lambat di router utama',
            'status' => 'open',
            'user_id' => $this->client->id,
        ]);
    }

    public function test_admin_can_move_ticket_status(): void
    {
        $response = $this->actingAs($this->admin)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'in_progress',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Status tiket berhasil diubah',
                'data' => [
                    'ticket_id' => $this->ticket->ticket_id,
                    'status' => 'in_progress',
                ],
            ]);

        $this->assertDatabaseHas('tickets', [
            'ticket_id' => $this->ticket->ticket_id,
            'status' => 'in_progress',
        ]);
    }

    public function test_owner_can_move_ticket_status(): void
    {
        $response = $this->actingAs($this->owner)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'escalated_to_owner',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Status tiket berhasil diubah',
            ]);

        $this->assertEquals('escalated_to_owner', $this->ticket->fresh()->status);
    }

    public function test_programmer_cannot_move_ticket_on_board(): void
    {
        $response = $this->actingAs($this->programmer)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'in_progress',
        ]);

        $response->assertStatus(403);
    }

    public function test_client_cannot_move_ticket_on_board(): void
    {
        $response = $this->actingAs($this->client)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'closed',
        ]);

        $response->assertStatus(403);
    }

    public function test_service_desk_cannot_move_ticket_on_board(): void
    {
        $response = $this->actingAs($this->serviceDesk)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'resolved',
        ]);

        $response->assertStatus(403);
    }

    public function test_moving_to_same_status_returns_unmodified_message(): void
    {
        $response = $this->actingAs($this->admin)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'open', // Already 'open'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Status tidak berubah',
            ]);

        $this->assertDatabaseCount('progress_logs', 0);
    }

    public function test_moving_ticket_creates_internal_progress_log(): void
    {
        $this->actingAs($this->admin)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'in_progress',
        ]);

        $this->assertDatabaseHas('progress_logs', [
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->admin->id,
            'previous_status' => 'open',
            'new_status' => 'in_progress',
            'is_internal' => true,
        ]);
    }

    public function test_moving_ticket_with_invalid_status_fails_validation(): void
    {
        $response = $this->actingAs($this->admin)->patchJson('/api/board/move', [
            'ticket_id' => $this->ticket->ticket_id,
            'new_status' => 'invalid_status_xyz',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_status']);
    }

    public function test_moving_non_existent_ticket_fails_validation(): void
    {
        $response = $this->actingAs($this->admin)->patchJson('/api/board/move', [
            'ticket_id' => 'TCK-NONEXISTENT',
            'new_status' => 'in_progress',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ticket_id']);
    }
}
