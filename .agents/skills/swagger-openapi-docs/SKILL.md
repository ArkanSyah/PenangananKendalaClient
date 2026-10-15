---
name: swagger-openapi-docs
description: >-
  Use this skill when managing, generating, or updating interactive Swagger UI (v5)
  and OpenAPI 3.1 specifications in the Laravel backend without using Postman.
---

# Swagger UI & OpenAPI 3.1 Documentation

## Overview
This skill governs the API documentation portal for the backend. The project uses **Swagger UI v5** and **OpenAPI 3.1** specification directly integrated into Laravel, replacing Postman collections completely.

---

## 1. Access Endpoints
- **Interactive Swagger UI**: `http://localhost:8000/swagger` (or `/api/documentation`)
- **OpenAPI 3.1 JSON Specification**: `http://localhost:8000/swagger.json` (or `/docs/api.json`)
- **Static Spec Location**: `webPenangananKendalaClientBE/swagger.json` and `public/swagger.json`

---

## 2. Testing API via Swagger UI (Try It Out)
1. Open `http://localhost:8000/swagger` in the browser.
2. Obtain a token by testing `POST /login` with demo credentials:
   - Email: `admin@example.com` (or `pm@example.com`, `programmer@example.com`, etc.)
   - Password: `password`
3. Copy the `access_token` from the response.
4. Click the green **Authorize (Lock icon)** at the top right of the Swagger UI.
5. Enter: `Bearer <access_token>`.
6. Now all authenticated endpoints can be executed directly using the **Try it out** button.

---

## 3. Updating OpenAPI Spec
When routes or controller methods are updated:
1. Ensure the backend server is running (`php artisan serve`).
2. Refresh the static spec by dumping the generated spec:
   ```bash
   curl -s http://127.0.0.1:8000/docs/api.json > public/swagger.json
   cp public/swagger.json ./swagger.json
   ```
3. Test that `/swagger` renders the new endpoints cleanly without syntax errors.
