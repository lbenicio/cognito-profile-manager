# Documentation

Start with the guide that matches what you need to do:

## Set up the app

- [Getting started](./getting-started/README.md): install dependencies, configure a local environment, and run the app.
- [Configuration reference](./getting-started/configuration.md): environment variables and service requirements.
- [Development workflow](./DEVELOPMENT.md): scripts, project layout, and local development.

## Understand and configure features

- [Architecture](./architecture/README.md): application layers, authentication, and type organization.
- [AWS Cognito setup](./guides/aws-cognito-setup.md): configure OIDC sign-in and callback URLs.
- [Passkeys](./guides/passkey-setup.md), [TOTP MFA](./guides/totp-setup.md), and [R2 storage](./guides/storage-setup.md).
- [API reference](./api/README.md): implemented HTTP route handlers and their behavior.
- [Logging](./LOGGING.md): logger configuration and usage.

## Deploy and contribute

- [Deployment](./deployment/README.md): Docker and Vercel notes.
- [Contributing](./contributing/README.md): coding conventions and checks to run before a pull request.
- [Security policy](../SECURITY.md): report a security issue privately.

## Historical notes

Documents in [Implementation summaries](./summaries/README.md) describe past changes. They may mention old paths, dependencies, or behavior; use the guides above for current instructions.
