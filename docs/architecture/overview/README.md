# System overview

Cognito Profile Manager is a server-rendered Next.js application. The browser renders the account interface; server actions and route handlers read the encrypted session and communicate with AWS Cognito and optional services.

```text
Browser
  │ pages, forms, locale preferences
  ▼
Next.js App Router
  ├── Server Actions ── Cognito user and security operations
  ├── Route Handlers ── OIDC redirects, callbacks, logout, health, ping
  ├── Session Layer ─── encrypted session cookie + optional Upstash cache
  └── Upload Actions ── presigned Cloudflare R2 uploads
```

## External services

- **AWS Cognito** is the identity provider and source of user attributes. OAuth 2.0 authorization-code sign-in uses its OIDC discovery configuration.
- **Cloudflare R2** stores profile images and banners. Uploads use short-lived presigned URLs.
- **Upstash Redis** is optional. If its REST URL or token is missing, the cache client falls back to a no-op implementation.
- **SMTP** is optional and used by the authenticated contact form.

## Source layout

| Path              | Responsibility                                             |
| ----------------- | ---------------------------------------------------------- |
| `src/app/`        | App Router pages, layouts, and HTTP route handlers         |
| `src/actions/`    | Server actions called by the UI                            |
| `src/components/` | Feature and shared UI components                           |
| `src/lib/`        | Cognito, session, cache, storage, logging, and helper code |
| `src/i18n/`       | Locale configuration and translation messages              |
| `src/types/`      | Shared TypeScript declarations                             |
| `src/content/`    | Markdown displayed by app pages                            |

See the [backend guide](../backend-api.md) for the distinction between server actions and route handlers.
