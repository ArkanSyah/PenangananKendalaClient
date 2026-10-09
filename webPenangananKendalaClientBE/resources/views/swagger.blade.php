<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swagger API Documentation - Penanganan Kendala Client</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui.css">
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .topbar {
            display: none !important;
        }
        .custom-navbar {
            background-color: #0f172a;
            color: #ffffff;
            padding: 14px 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .custom-navbar .brand {
            font-size: 1.25rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
            letter-spacing: -0.025em;
        }
        .custom-navbar .brand .badge {
            background: #0284c7;
            color: white;
            font-size: 0.75rem;
            padding: 3px 8px;
            border-radius: 9999px;
            font-weight: 600;
        }
        .custom-navbar .links {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .custom-navbar a {
            color: #38bdf8;
            text-decoration: none;
            font-size: 0.875rem;
            border: 1px solid rgba(56, 189, 248, 0.5);
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .custom-navbar a:hover {
            background: #38bdf8;
            color: #0f172a;
        }
        .swagger-ui .information-container {
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <header class="custom-navbar">
        <div class="brand">
            <span>🛡️ Penanganan Kendala Client API</span>
            <span class="badge">Swagger UI v5</span>
        </div>
        <div class="links">
            <a href="/swagger.json" target="_blank" download="swagger.json">Download swagger.json</a>
            <a href="/docs/api.json" target="_blank">OpenAPI 3.1 Spec</a>
        </div>
    </header>

    <div id="swagger-ui"></div>

    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: "/swagger.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                tryItOutEnabled: true
            });
        };
    </script>
</body>
</html>
