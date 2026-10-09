<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->string('phone', 20)->nullable();
            $table->string('email_fallback', 100)->nullable();
            $table->boolean('wa_enabled')->default(false);
            $table->boolean('email_enabled')->default(false);
            $table->boolean('in_app_enabled')->default(true);
            $table->boolean('notify_assigned')->default(true);
            $table->boolean('notify_resolved')->default(true);
            $table->boolean('notify_rejected')->default(true);
            $table->boolean('notify_escalated')->default(true);
            $table->boolean('notify_minor')->default(false);
            $table->enum('digest_mode', ['realtime', 'hourly', 'daily'])->default('realtime');
            $table->boolean('quiet_hours_enabled')->default(false);
            $table->time('quiet_hours_start')->default('20:00');
            $table->time('quiet_hours_end')->default('08:00');
            $table->string('timezone', 50)->default('Asia/Jakarta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
