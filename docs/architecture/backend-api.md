# Backend and HTTP routes

The server side is split between **Server Actions** and **Route Handlers**.

## Server Actions

Forms and feature components call actions in `src/actions/`. These actions read the current session on the server and perform authenticated Cognito operations, upload signing, or email delivery. Profile changes are not exposed as a public `/api/v1/user/profile` REST endpoint.

## Route Handlers

HTTP handlers live under `src/app/api/v1/`. Authentication handlers use redirects and cookies; they are not JSON endpoints. The [API reference](../api/README.md) documents each route.

| Route                           | Purpose                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `/api/v1/auth/sso/start`        | Starts Cognito OIDC authorization and sets a short-lived state cookie.          |
| `/api/v1/auth/callback/oidc`    | Exchanges the authorization code, verifies the ID token, and creates a session. |
| `/api/v1/auth/passkey/start`    | Starts the Cognito-hosted passkey setup flow for a signed-in user.              |
| `/api/v1/auth/callback/passkey` | Handles the passkey return and updates the Cognito passkey flag.                |
| `/api/v1/auth/logout`           | Clears the local session, then attempts provider logout.                        |
| `/api/v1/health`                | Checks cache and Cognito discovery connectivity.                                |
| `/api/v1/ping`                  | Returns a lightweight application response.                                     |

## Runtime configuration

Session encryption requires `TOTP_SECRET_ENCRYPTION_KEY`; Cognito SDK initialization requires `AWS_REGION`. Other services are configured only when their features are used. See the [environment reference](../getting-started/configuration.md).
