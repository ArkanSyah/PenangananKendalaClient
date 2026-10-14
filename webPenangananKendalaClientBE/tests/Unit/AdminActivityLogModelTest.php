<?php

namespace Tests\Unit;

use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminActivityLogModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_activity_log_belongs_to_admin_and_target_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'client']);

        $log = AdminActivityLog::create([
            'admin_id' => $admin->id,
            'action' => 'TOGGLE_USER_ACTIVE',
            'target_user_id' => $target->id,
            'details' => ['is_active' => false],
            'created_at' => now(),
        ]);

        $this->assertInstanceOf(User::class, $log->admin);
        $this->assertInstanceOf(User::class, $log->targetUser);
        $this->assertEquals($admin->id, $log->admin->id);
        $this->assertEquals($target->id, $log->targetUser->id);
        $this->assertIsArray($log->details);
        $this->assertFalse($log->details['is_active']);
    }
}
