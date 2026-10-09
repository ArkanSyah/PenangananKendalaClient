<?php

namespace Tests\Feature;

use App\Models\ProgressLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTicketTest extends TestCase
{
    use RefreshDatabase;

    private User $clientA;
    private User $clientB;
    private User $serviceDesk;

    protected function setUp(): void
    {
        parent::setUp();

        $this->clientA = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $this->clientB = User::factory()->create(['role' => 'client', 'is_active' => true]);
        $this->serviceDesk = User::factory()->create(['role' => 'service_desk', 'is_active' => true]);
    }

    public function test_client_can_create_ticket_with_initial_status_pending_confirmation(): void
    {
        $payload = [
            'title' => 'Sistem Kasir Error Error 500',
            'description' => 'Tidak bisa melakukan checkout transaksi siang ini.',
            'category' => 'Software',
        ];

        $response = $this->actingAs($this->clientA)->postJson('/api/client/tickets', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'title' => 'Sistem Kasir Error Error 500',
                'status' => 'pending_confirmation',
                'user_id' => $this->clientA->id,
            ]);

        $this->assertDatabaseHas('tickets', [
            'title' => 'Sistem Kasir Error Error 500',
            'status' => 'pending_confirmation',
            'user_id' => $this->clientA->id,
        ]);
    }

    public function test_client_ticket_creation_validation(): void
    {
        $response = $this->actingAs($this->clientA)->postJson('/api/client/tickets', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description']);
    }

    public function test_client_can_view_own_tickets_list(): void
    {
        // Ticket for Client A
        Ticket::create([
            'title' => 'Tiket Client A 1',
            'description' => 'Desc A 1',
            'status' => 'pending_confirmation',
            'user_id' => $this->clientA->id,
        ]);
        Ticket::create([
            'title' => 'Tiket Client A 2',
            'description' => 'Desc A 2',
            'status' => 'open',
            'user_id' => $this->clientA->id,
        ]);

        // Ticket for Client B
        Ticket::create([
            'title' => 'Tiket Client B',
            'description' => 'Desc B',
            'status' => 'open',
            'user_id' => $this->clientB->id,
        ]);

        $response = $this->actingAs($this->clientA)->getJson('/api/client/tickets');

        $response->assertStatus(200)
            ->assertJsonCount(2);

        $titles = collect($response->json())->pluck('title');
        $this->assertTrue($titles->contains('Tiket Client A 1'));
        $this->assertTrue($titles->contains('Tiket Client A 2'));
        $this->assertFalse($titles->contains('Tiket Client B'));
    }

    public function test_client_can_view_own_ticket_detail(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Pribadi Client A',
            'description' => 'Detail masalah printer',
            'status' => 'open',
            'user_id' => $this->clientA->id,
        ]);

        $response = $this->actingAs($this->clientA)->getJson("/api/client/tickets/{$ticket->ticket_id}");

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Tiket Pribadi Client A',
                'ticket_id' => $ticket->ticket_id,
            ]);
    }

    public function test_client_cannot_view_other_clients_ticket_detail(): void
    {
        $ticketOther = Ticket::create([
            'title' => 'Tiket Milik Client B',
            'description' => 'Rahasia dagang Client B',
            'status' => 'open',
            'user_id' => $this->clientB->id,
        ]);

        $response = $this->actingAs($this->clientA)->getJson("/api/client/tickets/{$ticketOther->ticket_id}");

        $response->assertStatus(404);
    }

    public function test_non_client_cannot_access_client_ticket_endpoints(): void
    {
        $response = $this->actingAs($this->serviceDesk)->getJson('/api/client/tickets');

        $response->assertStatus(403);
    }

    public function test_client_progress_logs_exclude_internal_notes(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Investigasi Jaringan',
            'description' => 'Jaringan bermasalah',
            'status' => 'open',
            'user_id' => $this->clientA->id,
        ]);

        // Public Log
        ProgressLog::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->serviceDesk->id,
            'previous_status' => null,
            'new_status' => 'open',
            'notes' => 'Catatan Publik: Tim sedang menangani tiket Anda.',
            'is_internal' => false,
        ]);

        // Internal Log
        ProgressLog::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->serviceDesk->id,
            'previous_status' => 'open',
            'new_status' => 'in_progress',
            'notes' => 'Catatan Rahasia: switch core rusak butuh penggantian.',
            'is_internal' => true,
        ]);

        $response = $this->actingAs($this->clientA)->getJson("/api/client/tickets/{$ticket->ticket_id}");

        $response->assertStatus(200);
        $logs = $response->json('progress_logs');

        $this->assertCount(1, $logs);
        $this->assertEquals('Catatan Publik: Tim sedang menangani tiket Anda.', $logs[0]['notes']);
    }
}
