<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketWorkflowEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    private User $serviceDesk;
    private User $pm;
    private User $programmer;
    private User $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->serviceDesk = User::factory()->create(['role' => 'service_desk', 'is_active' => true]);
        $this->pm = User::factory()->create(['role' => 'project_manager', 'is_active' => true]);
        $this->programmer = User::factory()->create(['role' => 'programmer', 'is_active' => true]);
        $this->client = User::factory()->create(['role' => 'client', 'is_active' => true]);
    }

    public function test_service_desk_can_confirm_pending_ticket(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Menunggu Konfirmasi',
            'description' => 'Deskripsi kendala klien',
            'status' => 'pending_confirmation',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->serviceDesk)->postJson("/api/tickets/{$ticket->ticket_id}/confirm", [
            'action' => 'confirm',
            'notes' => 'Informasi kendala sudah lengkap dan valid.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tiket berhasil dikonfirmasi dan masuk ke antrian.',
            ]);

        $this->assertEquals('open', $ticket->fresh()->status);
    }

    public function test_service_desk_can_reject_pending_ticket(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Spam / Duplikat',
            'description' => 'Duplikat tiket nomor sebelumnya',
            'status' => 'pending_confirmation',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->serviceDesk)->postJson("/api/tickets/{$ticket->ticket_id}/confirm", [
            'action' => 'reject',
            'notes' => 'Tiket ini merupakan duplikat dari tiket TCK-0001.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tiket ditolak dan ditutup.',
            ]);

        $this->assertEquals('rejected', $ticket->fresh()->status);
    }

    public function test_cannot_confirm_ticket_that_is_not_pending_confirmation(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Sudah Open',
            'description' => 'Tiket aktif',
            'status' => 'open',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->serviceDesk)->postJson("/api/tickets/{$ticket->ticket_id}/confirm", [
            'action' => 'confirm',
            'notes' => 'Coba konfirmasi tiket yang sudah open',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Hanya tiket berstatus menunggu konfirmasi yang dapat dikonfirmasi.',
            ]);
    }

    public function test_pm_can_update_ticket_priority(): void
    {
        $ticket = Ticket::create([
            'title' => 'Server Down Darurat',
            'description' => 'Produksi tidak bisa diakses',
            'status' => 'open',
            'priority' => 'low',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->pm)->postJson("/api/tickets/{$ticket->ticket_id}/priority", [
            'priority' => 'high',
            'notes' => 'Dinaikkan karena berdampak luas pada operasional',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prioritas tiket berhasil diperbarui.',
            ]);

        $this->assertEquals('high', $ticket->fresh()->priority);
    }

    public function test_pm_cannot_update_priority_of_closed_or_rejected_ticket(): void
    {
        $closedTicket = Ticket::create([
            'title' => 'Tiket Selesai',
            'description' => 'Masalah selesai',
            'status' => 'closed',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->pm)->postJson("/api/tickets/{$closedTicket->ticket_id}/priority", [
            'priority' => 'high',
        ]);

        $response->assertStatus(422);
    }

    public function test_non_pm_cannot_update_ticket_priority(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Biasa',
            'description' => 'Tiket biasa',
            'status' => 'open',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->programmer)->postJson("/api/tickets/{$ticket->ticket_id}/priority", [
            'priority' => 'high',
        ]);

        $response->assertStatus(403);
    }

    public function test_pm_updating_priority_validates_priority_enum(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Prioritas',
            'description' => 'Validasi prioritas',
            'status' => 'open',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->pm)->postJson("/api/tickets/{$ticket->ticket_id}/priority", [
            'priority' => 'super_urgent_invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['priority']);
    }

    public function test_cannot_update_status_to_same_status(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Uji Redundan',
            'description' => 'Test Desc',
            'status' => 'open',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->serviceDesk)->postJson("/api/tickets/{$ticket->ticket_id}/status", [
            'status' => 'open',
            'notes' => 'Status sama',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Status is already set to open',
            ]);
    }

    public function test_only_service_desk_can_close_ticket(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Uji Close',
            'description' => 'Test Desc',
            'status' => 'in_progress',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->programmer)->postJson("/api/tickets/{$ticket->ticket_id}/status", [
            'status' => 'closed',
            'notes' => 'Tutup paksa oleh programmer',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Only Service Desk can close or reject tickets.',
            ]);
    }

    public function test_programmer_cannot_directly_mark_ticket_as_resolved(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Uji Direct Resolve',
            'description' => 'Test Desc',
            'status' => 'in_progress',
            'user_id' => $this->client->id,
        ]);

        $response = $this->actingAs($this->programmer)->postJson("/api/tickets/{$ticket->ticket_id}/status", [
            'status' => 'resolved',
            'notes' => 'Langsung resolve tanpa review PM',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Programmer tidak dapat langsung menyelesaikan tiket. Ajukan ke PM terlebih dahulu.',
            ]);
    }

    public function test_programmer_cannot_submit_review_unless_in_progress_or_assigned(): void
    {
        $ticket = Ticket::create([
            'title' => 'Tiket Uji Review Guardrail',
            'description' => 'Test Desc',
            'status' => 'open',
            'user_id' => $this->client->id,
        ]);

        \App\Models\TicketAssignment::create([
            'ticket_id' => $ticket->id,
            'pm_id' => $this->pm->id,
            'programmer_id' => $this->programmer->id,
            'assigned_at' => now(),
            'estimated_hours' => 2,
        ]);

        $response = $this->actingAs($this->programmer)->postJson("/api/tickets/{$ticket->ticket_id}/status", [
            'status' => 'pending_review',
            'notes' => 'Minta review padahal status masih open',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Tiket hanya dapat diajukan review saat berstatus in_progress atau assigned.',
            ]);
    }
}
