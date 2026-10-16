<?php

namespace Tests\Feature;

use Tests\TestCase;

class SwaggerDocumentationTest extends TestCase
{
    public function test_swagger_ui_endpoint_returns_ok_html(): void
    {
        $response = $this->get('/swagger');

        $response->assertStatus(200);
        $response->assertSee('Swagger API Documentation');
        $response->assertSee('swagger-ui');
    }

    public function test_swagger_api_documentation_alias_returns_ok(): void
    {
        $response = $this->get('/api/documentation');

        $response->assertStatus(200);
        $response->assertSee('Swagger API Documentation');
    }

    public function test_docs_swagger_route_returns_ok(): void
    {
        $response = $this->get('/docs/swagger');

        $response->assertStatus(200);
        $response->assertSee('Swagger API Documentation');
    }

    public function test_swagger_json_endpoint_returns_valid_content(): void
    {
        $response = $this->get('/swagger.json');

        // Can be direct JSON (200) or redirect to /docs/api.json (302)
        $this->assertContains($response->getStatusCode(), [200, 302]);
    }
}
