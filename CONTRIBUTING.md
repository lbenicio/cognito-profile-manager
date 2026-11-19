# Contributing

Thanks for helping improve Cognito Profile Manager. For a large change or a change that affects the app's direction, open an issue first to discuss the approach.

Before contributing, please read the [Code of Conduct](CODE_OF_CONDUCT.md).

## Set up the project

Use Node.js 26 LTS (the package currently allows Node.js 22 or later), then install dependencies and start the local app:

```sh
npm ci
npm run setup:dev
npm run dev
```

The setup command creates `.env.development.local` with local defaults and a generated encryption key. The development login provides mock accounts, so AWS Cognito is optional for local development. See the [development guide](docs/DEVELOPMENT.md) and [configuration reference](docs/getting-started/configuration.md) for details.

## Make a change

- Keep changes focused and follow the existing patterns.
- Put shared TypeScript declarations under `src/types/**` and use type-only imports where appropriate.
- Keep credentials out of source code and never put secrets in `NEXT_PUBLIC_` variables.
- Update documentation when behavior, configuration, or setup changes.
- Do not include generated build output, local environment files, or unrelated formatting changes.

## Check your changes

Run these checks before opening a pull request:

```sh
npm run type:check
npx prettier --check src
npm run build:pkg
```

There is no automated unit-test command at this time. The `test:auth`, `test:logout`, and `test:cognito` scripts are optional manual checks; see the [development guide](docs/DEVELOPMENT.md) for their requirements.

## Open a pull request

Include a clear description of the problem and the change, the checks you ran, and any configuration or migration notes. Add screenshots for user-visible changes. For security vulnerabilities, follow the private reporting instructions in [SECURITY.md](SECURITY.md) instead of opening a public issue.

Contributions are made under the project's [GPL-3.0-only license](LICENSE.txt).
