<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('archived_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('original_ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->string('ticket_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('priority')->nullable();
            $table->string('status');
            $table->text('internal_notes')->nullable();
            $table->string('assigned_to_role')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('claimed_programmer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reporter_name')->nullable();
            $table->string('reporter_contact')->nullable();
            $table->string('contact_method')->nullable();
            $table->string('contact_method_notes')->nullable();
            $table->foreignId('archived_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('archived_at')->useCurrent();
            $table->string('archive_reason')->nullable();
            $table->timestamps();

            $table->index('ticket_id');
            $table->index('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_tickets');
    }
};
