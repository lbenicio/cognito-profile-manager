# Contributing

Thanks for considering a contribution. For larger changes, open an issue first so the approach can be discussed before implementation.

## Before you open a pull request

1. Use Node.js 22 or later and install dependencies with `npm ci`.
2. Create a branch for the change.
3. Follow the [coding standards](./coding-standards.md).
4. Run the project checks:

   ```sh
   npm run type:check
   npx prettier --check src
   npm run build:pkg
   ```

5. Update documentation when behavior, configuration, or setup changes.
6. Include a clear summary, verification notes, and screenshots for UI changes.

In the pull request description, summarize the change, list the checks you ran, and add screenshots for UI changes. For security vulnerabilities, follow the private reporting instructions in [SECURITY.md](../../SECURITY.md) instead of opening a public issue.
