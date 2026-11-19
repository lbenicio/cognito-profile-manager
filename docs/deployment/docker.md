# Docker and Docker Compose

The repository includes a multi-stage production `Dockerfile`, a development `Dockerfile.dev`, and Compose profiles for each.

## Requirements

- Docker Engine with Docker Compose v2
- Node.js 22 or later for host-based commands; the container images use Node.js 22

## Local development

Create the local settings file, then start the development profile:

```sh
npm run setup:dev
docker compose --env-file .env.development.local --profile dev up --build
```

The app is available at [http://localhost:3000](http://localhost:3000). The development service bind-mounts the source tree for live reload. Stop it with `Ctrl+C`, or run `docker compose --profile dev down` in another terminal.

To test real Cognito or optional integrations, add their values to `.env.development.local`. See the [configuration reference](../getting-started/configuration.md).

## Production

Create an environment file outside version control (for example, `.env.production`) or provide variables through your deployment secret manager. Configure at minimum:

- `APP_URL`, `TOTP_SECRET_ENCRYPTION_KEY`, and `AWS_REGION`
- Cognito client ID and OIDC discovery URL; set `COGNITO_CLIENT_SECRET` if the app client has a secret
- R2 credentials and bucket values when image uploads are enabled
- SMTP and Upstash values only when those integrations are enabled

Then build and start the production profile:

```sh
docker compose --env-file .env.production --profile prod up --build -d
```

The container listens on port 3000. View logs with `docker compose --profile prod logs -f web`; stop it with `docker compose --profile prod down`.

The Docker entrypoint replaces build-time `NEXT_PUBLIC_*` placeholders with runtime values. Treat all other credentials as server-side secrets. Use the same session-encryption key across replicas that need to read shared sessions.

## Troubleshooting

- **The app cannot read its environment:** confirm the file path passed to `--env-file` and that the variable names match the [configuration reference](../getting-started/configuration.md).
- **Cognito callback fails:** confirm the callback URL, protocol, host, and port match the Cognito app client's allowed callback URL. Use `NO_HTTPS=true` only for local HTTP.
- **Uploads fail:** check the R2 bucket, credentials, public asset URL, and bucket CORS settings.
- **The container is unhealthy:** Compose checks the app root route on port 3000. Inspect `docker compose logs` for startup errors.
