<?php

namespace Tests\Unit;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationPreferenceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_preference_belongs_to_user(): void
    {
        $user = User::factory()->create();

        $preference = NotificationPreference::create([
            'user_id' => $user->id,
            'email_fallback' => 'user@example.com',
            'in_app_enabled' => true,
            'wa_enabled' => false,
            'email_enabled' => true,
        ]);

        $this->assertInstanceOf(User::class, $preference->user);
        $this->assertEquals($user->id, $preference->user->id);
    }

    public function test_notification_preference_boolean_casting(): void
    {
        $user = User::factory()->create();

        $preference = NotificationPreference::create([
            'user_id' => $user->id,
            'in_app_enabled' => 1,
            'wa_enabled' => 0,
            'quiet_hours_enabled' => 1,
        ]);

        $this->assertIsBool($preference->in_app_enabled);
        $this->assertTrue($preference->in_app_enabled);
        $this->assertIsBool($preference->wa_enabled);
        $this->assertFalse($preference->wa_enabled);
        $this->assertIsBool($preference->quiet_hours_enabled);
        $this->assertTrue($preference->quiet_hours_enabled);
    }
}
