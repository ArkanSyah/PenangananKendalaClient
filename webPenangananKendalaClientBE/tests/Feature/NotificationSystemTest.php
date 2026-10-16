<?php

namespace Tests\Feature;

use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class NotificationSystemTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
            'is_active' => true,
        ]);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin_notif@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_active' => true,
        ]);
    }

    public function test_user_can_view_notification_preferences(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/notification/preferences');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user_id',
                    'email_fallback',
                    'wa_enabled',
                    'email_enabled',
                    'in_app_enabled',
                ],
            ]);
    }

    public function test_user_can_update_notification_preferences(): void
    {
        $payload = [
            'wa_enabled' => true,
            'email_enabled' => true,
            'in_app_enabled' => true,
            'digest_mode' => 'daily',
            'quiet_hours_enabled' => true,
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '07:00',
        ];

        $response = $this->actingAs($this->user)->putJson('/api/notification/preferences', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.digest_mode', 'daily')
            ->assertJsonPath('data.quiet_hours_enabled', true);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $this->user->id,
            'digest_mode' => 'daily',
        ]);
    }

    public function test_user_can_view_in_app_notifications(): void
    {
        $ticket = Ticket::create([
            'title' => 'Sample Notification Ticket',
            'description' => 'Test description',
            'status' => 'open',
            'user_id' => $this->user->id,
        ]);

        NotificationLog::create([
            'ticket_id' => $ticket->id,
            'recipient_user_id' => $this->user->id,
            'channel' => 'in_app',
            'message' => 'Status tiket Anda telah diperbarui menjadi open.',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/notifications/in-app');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'unread_count',
                'items',
            ])
            ->assertJsonPath('unread_count', 1);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $ticket = Ticket::create([
            'title' => 'Sample Ticket For Read',
            'description' => 'Test description',
            'status' => 'open',
            'user_id' => $this->user->id,
        ]);

        $notif = NotificationLog::create([
            'ticket_id' => $ticket->id,
            'recipient_user_id' => $this->user->id,
            'channel' => 'in_app',
            'message' => 'Notifikasi baru yang belum dibaca.',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/notifications/in-app/{$notif->id}/read");

        $response->assertStatus(200);
        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_admin_can_view_quota(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/quota');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
    }

    public function test_non_admin_cannot_view_quota(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/admin/quota');

        $response->assertStatus(403);
    }
}
