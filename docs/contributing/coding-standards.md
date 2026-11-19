# Coding standards

Keep changes small, typed, and consistent with the current codebase.

## TypeScript

- Put shared `type`, `interface`, and `enum` declarations under `src/types/**`.
- Import type-only declarations with `import type`.
- Avoid `any`; use a precise type or `unknown` followed by validation at untrusted boundaries.
- Prefer inferred types for local variables and explicit types for shared contracts and public function boundaries.

## React and Next.js

- Keep browser-only state and APIs in components marked `'use client'`.
- Keep credentials and provider calls on the server.
- Use Server Actions for authenticated mutations and Route Handlers for HTTP callbacks or endpoints.
- Validate user input at the server boundary.

## Formatting and checks

The repository uses Prettier with the checked-in configuration. Before submitting, run:

```sh
npm run type:check
npx prettier --check src
npm run build:pkg
```

Do not include generated build output, local environment files, credentials, or unrelated formatting changes in a pull request.
