# Authentication routes

These route handlers support the browser-based Cognito flow. They use redirects and cookies; they are not a token API for third-party clients.

## `GET /api/v1/auth/sso/start`

Starts OIDC authorization. The handler reads `NEXT_PUBLIC_COGNITO_CLIENT_ID`, `NEXT_PUBLIC_OAUTH2_SCOPE`, and `NEXT_PUBLIC_COGNITO_WELLKNOWN`, creates a short-lived HTTP-only `oauth_state` cookie, then redirects to the provider authorization endpoint.

If configuration is missing or the discovery request fails, the handler redirects to `/login` with an error query parameter.

## `GET /api/v1/auth/callback/oidc`

Cognito returns the browser here after authorization. The query string includes `code` and `state` on success, or provider error fields on failure. The route compares the returned state with the `oauth_state` cookie, exchanges the code server-side, validates the ID token, writes an encrypted HTTP-only `session` cookie, clears the state cookie, and redirects to `/`.

The callback URL must exactly match one of the allowed callback URLs in the Cognito app client. See [Cognito setup](../guides/aws-cognito-setup.md).

## `GET /api/v1/auth/passkey/start`

Requires an active user session. Redirects the user to the Cognito-hosted passkey setup flow. If there is no session, redirects to the login page.

## `GET /api/v1/auth/callback/passkey`

Handles the provider return. A `result=success` query value updates the user's `custom:pless` attribute and redirects to `/security`; provider error values are forwarded to the security page.

## `GET` and `POST /api/v1/auth/logout`

Both methods clear the local session. For a Cognito session, the handler attempts to redirect through the provider's logout endpoint and returns to `/login`; if provider logout cannot be constructed, it falls back to local logout.

## Operational endpoints

- `GET /api/v1/health` checks cache and Cognito OIDC discovery access. It returns `200` for a healthy result and `503` if a check fails. With no Cognito discovery URL configured, the Cognito check fails.
- `GET /api/v1/ping` returns `{ "message": "pong", "timestamp": "…" }`.
