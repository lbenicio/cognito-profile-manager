# Environment configuration

The app reads environment variables from Next.js environment files or the process environment. For local development, use the ignored `.env.development.local` file created by `npm run setup:dev`. There is no tracked `.env.example` file.

Restart the server after changing values. Treat credentials as secrets, and never commit local environment files. Any `NEXT_PUBLIC_` value may be included in browser code and must not contain a secret.

## Core application

| Variable                     | Required for               | Description                                                                                                                                 |
| ---------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `TOTP_SECRET_ENCRYPTION_KEY` | Sessions                   | Base64-encoded 32-byte key used to encrypt the session cookie. Generate with `npm run generate:key`; `setup:dev` creates one automatically. |
| `AWS_REGION`                 | Cognito SDK initialization | AWS region, such as `us-east-1`. The SDK client requires this even when you are developing without real Cognito sign-in.                    |
| `APP_URL`                    | URL fallback               | Public base URL. Defaults to `http://localhost:3000` when request headers are unavailable.                                                  |
| `NO_HTTPS`                   | Local HTTP callbacks       | Set to `true` for local HTTP development. Leave unset or set to `false` behind production HTTPS.                                            |

For a local setup, the defaults should be:

```dotenv
APP_URL=http://localhost:3000
NO_HTTPS=true
AWS_REGION=us-east-1
```

Generate a new key when needed:

```sh
npm run generate:key
```

The command prints the key to the terminal. Store it in your secret manager or ignored environment file; anyone with the key can decrypt sessions created with it.

## AWS Cognito and OIDC

These values are needed for real Cognito sign-in. Mock login in development does not require the Cognito client values.

| Variable                        | Description                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito app client ID. This is public configuration, not a secret.                                 |
| `COGNITO_CLIENT_SECRET`         | Optional app client secret. Set it when using a confidential app client.                           |
| `NEXT_PUBLIC_COGNITO_WELLKNOWN` | Full OIDC discovery URL for the user pool, ending in `/.well-known/openid_configuration`.          |
| `NEXT_PUBLIC_OAUTH2_SCOPE`      | Optional space-separated scopes. Defaults to `openid email profile aws.cognito.signin.user.admin`. |
| `COGNITO_ADMIN_GROUP_NAME`      | Cognito group treated as the admin group. Defaults to `admins`.                                    |
| `COGNITO_GROUPS_CLAIM_KEY`      | JWT claim containing group membership. Defaults to `cognito:groups`.                               |

Register these callback URLs in the Cognito app client:

- `http://localhost:3000/api/v1/auth/callback/oidc` for local sign-in
- `http://localhost:3000/api/v1/auth/callback/passkey` for the passkey callback
- `https://your-domain.example/api/v1/auth/callback/oidc` and `/api/v1/auth/callback/passkey` in production

Also register the local and production `/login` URLs as allowed sign-out URLs. See the [Cognito setup guide](../guides/aws-cognito-setup.md) for the app client setup.

## Optional integrations

### Cloudflare R2 uploads

Set these values to enable profile image and banner uploads. The app currently builds its S3 endpoint from the Cloudflare account ID.

| Variable                    | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `R2_ACCOUNT_ID`             | Cloudflare account ID.                           |
| `R2_ACCESS_KEY_ID`          | R2 access key ID.                                |
| `R2_SECRET_ACCESS_KEY`      | R2 secret access key.                            |
| `R2_BUCKET_NAME`            | Bucket used for uploaded assets.                 |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public base URL used to display uploaded assets. |

See the [storage guide](../guides/storage-setup.md) for bucket and upload details.

### Upstash Redis cache

The cache provider defaults to `upstash`. Without both credentials, the app logs a warning and uses a no-op cache. The health endpoint reports on the configured cache and OIDC discovery endpoint.

| Variable                    | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `CACHE_PROVIDER`            | Currently, `upstash` is supported; an unknown value disables caching. |
| `upstash_KV_REST_API_URL`   | Upstash Redis REST URL. Preserve this exact casing.                   |
| `upstash_KV_REST_API_TOKEN` | Upstash Redis REST token. Preserve this exact casing.                 |

### Contact form email

All six values are required for the authenticated contact form to send mail:

`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, and `CONTACT_FORM_TO_EMAIL`.

### Admin dashboard and logs

| Variable                          | Description                                                               |
| --------------------------------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ADMIN_DASHBOARD_URL` | Optional link to an external admin dashboard.                             |
| `LOG_LEVEL`                       | Optional logger threshold: `DEBUG`, `INFO`, `WARN`, `ERROR`, or `SILENT`. |

## Production notes

- Use a unique encryption key per environment and keep it stable across app instances that share sessions.
- Use HTTPS and register the exact HTTPS callback and sign-out URLs with Cognito.
- Keep `COGNITO_CLIENT_SECRET`, R2 credentials, SMTP credentials, Upstash tokens, and the encryption key server-side.
- Set `APP_URL` to the public origin when request headers are not available to construct URLs.
