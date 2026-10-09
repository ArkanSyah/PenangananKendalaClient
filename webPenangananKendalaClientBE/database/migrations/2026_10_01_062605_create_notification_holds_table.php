<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained('notification_batches')->cascadeOnDelete();
            $table->timestamp('scheduled_release_at')->index();
            $table->enum('status', ['pending', 'released', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index(['status', 'scheduled_release_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_holds');
    }
};
