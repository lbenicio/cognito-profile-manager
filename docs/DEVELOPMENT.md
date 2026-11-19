# Development

## Requirements

- Node.js 22 or later
- npm
- Git

## Start the app

```sh
npm ci
npm run setup:dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The setup script creates `.env.development.local` with a generated session-encryption key and local settings. It does not overwrite an existing file. See the [configuration reference](./getting-started/configuration.md) before adding service credentials.

Development mock login is available only when `NODE_ENV=development`. Choose a mock user or mock admin on the login page. Real Cognito sign-in is optional; see [AWS Cognito setup](./guides/aws-cognito-setup.md).

## Useful commands

| Command                    | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `npm run dev`              | Run Next.js on port 3000                   |
| `npm run type:check`       | Check the TypeScript project               |
| `npx prettier --check src` | Check formatting in source files           |
| `npm run fmt:format`       | Format the repository with Prettier        |
| `npm run build:pkg`        | Build the production app                   |
| `npm run start:prod`       | Start the production server after building |
| `npm run generate:key`     | Generate a session-encryption key          |
| `npm run setup:dev`        | Create local development settings          |

There is no automated unit-test command in `package.json`. `test:auth` and `test:logout` are manual HTTP smoke checks configured for a local server on port 9002. `test:cognito` checks the discovery URL in `.env.development.local` and makes a network request. They are optional scripts, not part of the default workflow.

## Project layout

```text
src/
├── actions/       Server actions used by the UI
├── app/           Next.js App Router pages and route handlers
├── components/    UI and feature components
├── content/       Markdown rendered by app pages
├── i18n/          Locale setup and translation JSON
├── lib/           Authentication, Cognito, session, cache, and storage code
└── types/         Shared type declarations
docs/              Developer and operator documentation
scripts/           Local setup and smoke-check scripts
```

## Working on a change

1. Keep shared TypeScript declarations under `src/types/**` and import types with `import type` where possible.
2. Keep credentials in ignored local environment files or a deployment secret manager. Do not put secrets in `NEXT_PUBLIC_` variables.
3. Before opening a pull request, run:

   ```sh
   npm run type:check
   npx prettier --check src
   npm run build:pkg
   ```

4. Describe the behavior change and include screenshots for user-visible changes.

See [Coding standards](./contributing/coding-standards.md) and [Contributing](./contributing/README.md) for review expectations.
