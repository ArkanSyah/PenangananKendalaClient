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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id')->unique();
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['Jaringan', 'Hardware', 'Software', 'Akun', 'Lainnya'])->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'belum_ditentukan'])->default('belum_ditentukan');
            $table->enum('status', [
                'pending_confirmation',
                'open',
                'escalated_to_pm',
                'waiting_programmer',
                'waiting_pm_approval',
                'assigned',
                'in_progress',
                'pending_review',
                'escalated_to_owner',
                'resolved',
                'closed',
                'rejected'
            ])->default('open');
            $table->text('internal_notes')->nullable();
            $table->string('assigned_to_role')->nullable();
            $table->string('attachment_path')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('claimed_programmer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reporter_name')->nullable();
            $table->string('reporter_contact')->nullable();
            $table->enum('contact_method', [
                'whatsapp',
                'telepon',
                'email',
                'walk_in',
                'lainnya',
            ])->nullable();
            $table->string('contact_method_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
