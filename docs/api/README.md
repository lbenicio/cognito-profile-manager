# HTTP API reference

The HTTP route handlers are implemented under `src/app/api/v1/`. Authentication routes primarily redirect between the app and Cognito. Account and profile mutations are performed through Next.js Server Actions; there is no public REST profile endpoint.

## Routes

| Method        | Path                            | Behavior                                                                                                 |
| ------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `GET`         | `/api/v1/auth/sso/start`        | Starts Cognito OIDC authorization and redirects to the provider.                                         |
| `GET`         | `/api/v1/auth/callback/oidc`    | Handles the OIDC authorization response and creates a local session.                                     |
| `GET`         | `/api/v1/auth/passkey/start`    | Starts passkey setup for the signed-in user.                                                             |
| `GET`         | `/api/v1/auth/callback/passkey` | Handles the passkey setup return.                                                                        |
| `GET`, `POST` | `/api/v1/auth/logout`           | Clears the local session and attempts Cognito logout.                                                    |
| `GET`         | `/api/v1/health`                | Checks the cache and Cognito discovery endpoint. Returns `200` when healthy or `503` when a check fails. |
| `GET`         | `/api/v1/ping`                  | Returns a lightweight `pong` response.                                                                   |

See [authentication routes](./auth-endpoints.md) for query parameters and redirect behavior. The [backend architecture](../architecture/backend-api.md) explains why profile updates use Server Actions instead of REST routes.
