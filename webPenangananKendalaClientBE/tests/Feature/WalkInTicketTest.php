<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalkInTicketTest extends TestCase
{
    use RefreshDatabase;

    private User $serviceDesk;
    private User $programmer;
    private User $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->serviceDesk = User::factory()->create(['role' => 'service_desk', 'is_active' => true]);
        $this->programmer = User::factory()->create(['role' => 'programmer', 'is_active' => true]);
        $this->client = User::factory()->create(['role' => 'client', 'is_active' => true]);
    }

    public function test_service_desk_can_create_walk_in_ticket(): void
    {
        $payload = [
            'reporter_name' => 'Pak Bambang (Walk-in)',
            'reporter_contact' => '081234567890',
            'contact_method' => 'walk_in',
            'title' => 'PC Kasir Tidak Menyala',
            'description' => 'Power supply unit mati mendadak saat transaksi kasir berjalan.',
            'category' => 'Hardware',
        ];

        $response = $this->actingAs($this->serviceDesk)->postJson('/api/tickets/walk-in', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'title' => 'PC Kasir Tidak Menyala',
                'status' => 'open',
                'reporter_name' => 'Pak Bambang (Walk-in)',
                'contact_method' => 'walk_in',
            ]);

        $this->assertDatabaseHas('tickets', [
            'reporter_name' => 'Pak Bambang (Walk-in)',
            'status' => 'open',
            'user_id' => $this->serviceDesk->id,
        ]);
    }

    public function test_walk_in_ticket_requires_mandatory_fields(): void
    {
        $response = $this->actingAs($this->serviceDesk)->postJson('/api/tickets/walk-in', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['reporter_name', 'contact_method', 'title', 'description']);
    }

    public function test_walk_in_ticket_validates_contact_method_enum(): void
    {
        $response = $this->actingAs($this->serviceDesk)->postJson('/api/tickets/walk-in', [
            'reporter_name' => 'Andi',
            'contact_method' => 'invalid_telepathy',
            'title' => 'Test Title',
            'description' => 'Test Desc',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['contact_method']);
    }

    public function test_walk_in_ticket_validates_category_enum(): void
    {
        $response = $this->actingAs($this->serviceDesk)->postJson('/api/tickets/walk-in', [
            'reporter_name' => 'Andi',
            'contact_method' => 'whatsapp',
            'title' => 'Test Title',
            'description' => 'Test Desc',
            'category' => 'UnknownCategory',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    public function test_programmer_cannot_create_walk_in_ticket(): void
    {
        $response = $this->actingAs($this->programmer)->postJson('/api/tickets/walk-in', [
            'reporter_name' => 'Client',
            'contact_method' => 'whatsapp',
            'title' => 'Walk-in by Programmer',
            'description' => 'Should be forbidden',
        ]);

        $response->assertStatus(403);
    }

    public function test_client_cannot_create_walk_in_ticket(): void
    {
        $response = $this->actingAs($this->client)->postJson('/api/tickets/walk-in', [
            'reporter_name' => 'Client',
            'contact_method' => 'telepon',
            'title' => 'Walk-in by Client',
            'description' => 'Should be forbidden',
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_create_walk_in_ticket(): void
    {
        $response = $this->postJson('/api/tickets/walk-in', [
            'reporter_name' => 'Client',
            'contact_method' => 'telepon',
            'title' => 'Walk-in Anonymous',
            'description' => 'Should be 401',
        ]);

        $response->assertStatus(401);
    }

    public function test_walk_in_ticket_creates_audit_progress_log(): void
    {
        $response = $this->actingAs($this->serviceDesk)->postJson('/api/tickets/walk-in', [
            'reporter_name' => 'Siti Aminah',
            'contact_method' => 'telepon',
            'title' => 'Telepon Masalah Internet',
            'description' => 'Kabel LAN terputus di lantai 2',
        ]);

        $response->assertStatus(201);
        $ticketId = $response->json('id');

        $this->assertDatabaseHas('progress_logs', [
            'ticket_id' => $ticketId,
            'user_id' => $this->serviceDesk->id,
            'new_status' => 'open',
            'is_internal' => true,
        ]);
    }
}
