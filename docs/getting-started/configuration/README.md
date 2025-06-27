# Configuration

The Cognito Profile Manager is configured using environment variables. These are stored in a `.env.local` file in the project's root directory.

Create this file by copying the template: `cp .env.example .env.local`.

## Application Settings

- `NODE_ENV`: The runtime environment. Set to `"development"` for local development.
- `TOTP_SECRET_ENCRYPTION_KEY`: A 32-byte, base64-encoded key used to encrypt TOTP secrets before storing them. Generate one with: `openssl rand -base64 32`.

## Security (AWS Cognito & OAuth2)

These variables connect the application to your AWS Cognito User Pool.

- `NEXT_PUBLIC_OAUTH2_CALLBACK_URL`: The full URL where Cognito will redirect after a successful login. For local development, this is typically `http://localhost:3000/api/v1/auth/callback/oidc`. This must be added to the "Allowed callback URLs" in your Cognito App Client settings.
- `NEXT_PUBLIC_PASSKEY_CALLBACK_URL`: The callback URL for Passkey operations.
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: The App Client ID from your Cognito User Pool.
- `COGNITO_CLIENT_SECRET`: The App Client Secret. This is required for the authorization code grant flow.
- `NEXT_PUBLIC_COGNITO_WELLKNOWN`: The OpenID Connect discovery endpoint for your User Pool. It looks like: `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/openid-configuration`.
- `NEXT_PUBLIC_OAUTH2_SCOPE`: The OAuth2 scopes to request during authentication. `openid profile email aws.cognito.signin.user.admin` are common defaults.

## Admin Settings

- `NEXT_PUBLIC_ADMIN_DASHBOARD_URL`: The URL to an external admin dashboard, if you have one.
- `COGNITO_ADMIN_GROUP_NAME`: The name of the user group in Cognito that grants admin privileges.
- `COGNITO_GROUPS_CLAIM_KEY`: The key used in the ID token to identify a user's groups (e.g., `cognito:groups`).

## Cloudflare R2 / S3-Compatible Storage

These variables are for storing user assets like profile pictures.

- `R2_ACCOUNT_ID`: Your Cloudflare Account ID.
- `R2_ACCESS_KEY_ID`: The Access Key ID for your R2 bucket.
- `R2_SECRET_ACCESS_KEY`: The Secret Access Key for your R2 bucket.
- `R2_BUCKET_NAME`: The name of the R2 bucket.
- `NEXT_PUBLIC_R2_PUBLIC_URL`: The public URL for accessing assets in your R2 bucket.

## AWS General

- `AWS_REGION`: The AWS region where your Cognito User Pool is located (e.g., `sa-east-1`).
