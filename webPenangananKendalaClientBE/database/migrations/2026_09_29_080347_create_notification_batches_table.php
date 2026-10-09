<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->string('status_from')->nullable();
            $table->string('status_to');
            $table->json('event_chain');
            $table->foreignId('triggered_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('first_event_at');
            $table->timestamp('last_event_at');
            $table->timestamp('expires_at')->index();
            $table->enum('status', ['pending', 'sent', 'skipped'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_batches');
    }
};
