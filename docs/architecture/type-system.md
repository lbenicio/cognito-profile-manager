# Type system

All shared TypeScript declarations live under `src/types/**`. Keep `type`, `interface`, and `enum` declarations out of components, actions, route handlers, and utility modules; import the shared declaration at its use site.

```ts
// src/types/profile.types.ts
export interface ProfileSummary {
  name: string;
  email: string;
}

// src/components/profile-card.tsx
import type { ProfileSummary } from '@/types/profile.types';
```

Use `import type` for declarations that are only used by the type checker. Prefer a narrow domain type over `any`; use `unknown` at untrusted boundaries and validate it before use.

## Current organization

| Path                                                        | Contents                                          |
| ----------------------------------------------------------- | ------------------------------------------------- |
| `src/types/actions/` and `src/types/actions.types.ts`       | Action inputs and results                         |
| `src/types/api/`                                            | HTTP and health response shapes                   |
| `src/types/auth/`, `src/types/auth.types.ts`                | Authentication and token types                    |
| `src/types/contracts/`                                      | Shared auth, session, error, and API contracts    |
| `src/types/forms/`                                          | Form schemas, inferred values, and form props     |
| `src/types/user/`                                           | User and session-facing data                      |
| `src/types/components.types.ts` and `src/types/ui.types.ts` | Shared component props and UI library types       |
| `src/types/index.ts`                                        | Public type barrel for commonly used declarations |

Zod schemas can live beside the inferred form type in `src/types/forms/`. This keeps runtime validation and the corresponding static type together while respecting the shared-types boundary.

## Adding or changing a type

1. Put the declaration in the closest domain file under `src/types/`; add a new file when it makes the ownership clearer.
2. Export it from `src/types/index.ts` only when a central import is useful; direct domain imports are also fine.
3. Update consumers to import from `@/types/**` and remove the old declaration.
4. Run `npm run type:check` and `npx prettier --check src`.

Avoid parallel definitions of the same contract. If an API response is validated at runtime, derive the static type from its schema where practical.
