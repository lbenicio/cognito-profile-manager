# Cognito Profile Manager

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE.txt)

Cognito Profile Manager (also called **Outpost**) is a Next.js application for managing an AWS Cognito user profile and account security. It includes a development-only mock login, so you can explore the app without connecting an AWS account.

## Features

- Cognito sign-in through OAuth 2.0 and OpenID Connect
- Profile, account, notification, and privacy settings
- TOTP multi-factor authentication and Cognito WebAuthn passkey management
- Profile image and banner uploads to Cloudflare R2
- English, Spanish, French, German, and Portuguese interface translations
- Optional Upstash Redis caching
- Development-only mock user and admin accounts

## Run locally

**Requirements:** Node.js 22 or later, npm, and Git. AWS Cognito and R2 are optional for local mock development.

```sh
git clone https://github.com/lbenicio/cognito-profile-manager.git
cd cognito-profile-manager
npm ci
npm run setup:dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then choose a mock account on the login page. The mock login buttons are available only in development mode.

`setup:dev` creates `.env.development.local` with a new session-encryption key and local defaults. It leaves an existing file in place; if you already have one, make sure `TOTP_SECRET_ENCRYPTION_KEY`, `AWS_REGION`, `APP_URL`, and `NO_HTTPS` are set as described in the [configuration guide](docs/getting-started/configuration.md). This file is ignored by Git.

To use a real Cognito user pool or enable optional services, follow [Getting started](docs/getting-started/README.md) and the [service setup guides](docs/guides/README.md).

## Common commands

| Command                    | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `npm run dev`              | Start the development server on port 3000          |
| `npm run type:check`       | Run the TypeScript compiler without emitting files |
| `npx prettier --check src` | Check source formatting                            |
| `npm run build:pkg`        | Create a production build                          |
| `npm run start:prod`       | Serve the production build                         |
| `npm run generate:key`     | Print a new 32-byte session-encryption key         |
| `npm run setup:dev`        | Create local development environment settings      |

See [Development](docs/DEVELOPMENT.md) for the workflow and [Contributing](docs/contributing/README.md) before opening a change.

## Documentation

The [documentation index](docs/README.md) links to setup, architecture, API, deployment, and contribution guides.

## Security and license

Do not commit environment files or put secrets in variables prefixed with `NEXT_PUBLIC_`; those values can be included in browser code. To report a vulnerability, follow [SECURITY.md](SECURITY.md). This project is licensed under [GPL-3.0](LICENSE.txt).
