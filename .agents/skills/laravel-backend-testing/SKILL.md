---
name: laravel-backend-testing
description: >-
  Use this skill when writing, running, debugging, or expanding PHPUnit Unit and Feature tests
  for the Laravel 11 backend ticketing system. Covers SQLite in-memory test isolation,
  Sanctum RBAC authentication across 6 roles, and ticket workflow guardrails.
---

# Laravel Backend Testing (PHPUnit & Feature Tests)

## Overview
This skill defines the testing standards and procedures for the **Penanganan Kendala Client** Laravel 11 backend. All tests must be fast, completely isolated, and achieve 100% pass rate.

## Testing Architecture
- **Framework**: PHPUnit 11 / Laravel Test Runner
- **Database for Testing**: SQLite in-memory (`:memory:`)
- **Isolation Trait**: `Illuminate\Foundation\Testing\RefreshDatabase`
- **Execution Command**: `php artisan test` (from `webPenangananKendalaClientBE/`)

---

## 1. Directory Structure Conventions
Place tests in the appropriate directory:
- `tests/Unit/` : Model relationships, custom attribute casts, helper methods, scopes.
- `tests/Feature/` : HTTP endpoints, RBAC policies, status transition guardrails, validation rules, notifications, PWA integrations.

---

## 2. Standard Test Template
Always structure test methods following this pattern:

```php
<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->client = User::factory()->create(['role' => 'client', 'is_active' => true]);
    }

    public function test_example_endpoint_with_rbac(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'name', 'email']]]);
    }
}
```

---

## 3. RBAC Testing Rules (6 Roles)
When testing access control, test both the authorized actor and unauthorized actors:
- **`admin`**: Full access to user management, stats, audit logs, and board move.
- **`owner`**: High-level escalation approval, board move, ticket archive/restore.
- **`project_manager`**: Ticket assignment, priority update, claim approval/rejection, review programmer work.
- **`programmer`**: Claim tickets, update assigned tickets to `in_progress` / `pending_review`. Cannot directly resolve or close.
- **`service_desk`**: Create tickets, walk-in tickets, confirm/reject client tickets, close/reopen tickets.
- **`client`**: Create tickets, view only their own tickets, public logs only (internal notes must be hidden).

---

## 4. SQLite vs MySQL Compatibility Guardrails
- In test environment (`sqlite :memory:`), avoid raw `ALTER TABLE ... MODIFY COLUMN ENUM` statements.
- Always guard raw MySQL statements in migrations with:
  ```php
  if (DB::getDriverName() !== 'sqlite') { ... }
  ```
- Ensure all required foreign keys and non-null columns (e.g. `estimated_hours`, `ticket_id`, `event_chain`) are explicitly populated in test fixtures.

---

## 5. Verification
After adding or modifying tests, always verify:
```bash
php artisan test
```
All tests must pass with 0 failures and 0 warnings.
