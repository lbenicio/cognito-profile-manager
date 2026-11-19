# Install for local development

## Requirements

- Node.js 26 LTS is recommended. The package engine currently allows Node.js 22 or later.
- npm (the repository includes `package-lock.json`)
- Git

AWS Cognito, Cloudflare R2, and Upstash Redis are optional when you use the development mock accounts.

## Install and run

```sh
git clone https://github.com/lbenicio/cognito-profile-manager.git
cd cognito-profile-manager
npm ci
npm run setup:dev
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). On the login page, select a mock user or mock admin account. These options are only available when `NODE_ENV` is `development`.

The setup command creates `.env.development.local` and generates a session-encryption key. It does not overwrite that file if it already exists. Check the required local values in the [configuration reference](./configuration.md). Never commit the file.

## Connect Cognito

To test real sign-in, configure a Cognito user pool and app client, then set the Cognito variables in `.env.development.local`. The [Cognito guide](../guides/aws-cognito-setup.md) lists callback URLs and required scopes. Restart the dev server after changing environment variables.

## Verify a change

```sh
npm run type:check
npx prettier --check src
npm run build:pkg
```

The production build needs `AWS_REGION` and `TOTP_SECRET_ENCRYPTION_KEY`. Some integrations also require their service credentials at runtime.
