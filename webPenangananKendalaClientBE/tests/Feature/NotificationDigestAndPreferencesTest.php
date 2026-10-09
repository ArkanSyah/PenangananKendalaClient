<?php

namespace Tests\Feature;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationDigestAndPreferencesTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'programmer', 'is_active' => true]);
    }

    public function test_user_can_view_notification_logs(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/notification/logs');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page']);
    }

    public function test_user_can_preview_daily_digest(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/notification/preview-digest?period=daily');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'preview',
                'item_count',
                'period',
                'is_sample',
            ]);
    }

    public function test_user_can_preview_hourly_digest(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/notification/preview-digest?period=hourly');

        $response->assertStatus(200)
            ->assertJson([
                'period' => 'hourly',
            ]);
    }

    public function test_preview_digest_validates_invalid_period(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/notification/preview-digest?period=weekly');

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Period harus hourly atau daily.',
            ]);
    }

    public function test_user_can_update_quiet_hours(): void
    {
        $response = $this->actingAs($this->user)->putJson('/api/notification/preferences', [
            'quiet_hours_enabled' => true,
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '07:00',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'quiet_hours_enabled' => true,
                    'quiet_hours_start' => '22:00',
                    'quiet_hours_end' => '07:00',
                    'timezone' => 'Asia/Jakarta',
                ],
            ]);
    }

    public function test_user_can_update_digest_mode_to_daily(): void
    {
        $response = $this->actingAs($this->user)->putJson('/api/notification/preferences', [
            'digest_mode' => 'daily',
            'email_enabled' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'digest_mode' => 'daily',
                    'email_enabled' => true,
                ],
            ]);
    }
}
