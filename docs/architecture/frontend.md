# Frontend

The interface uses the Next.js App Router and React Server Components by default. Components that need browser state or browser APIs opt into client rendering with `'use client'`.

## Main areas

- `src/app/(main)/` contains the authenticated account, profile, security, settings, contact, and messages pages.
- `src/app/login/` contains the sign-in page.
- `src/components/` contains feature components and the shared UI kit in `src/components/ui/`.
- `src/i18n/` configures `next-intl` and stores messages in `src/i18n/locales/`.
- `src/navigation.ts` configures localized navigation and locale cookies.
- `src/content/` contains Markdown pages rendered by the application.

## Languages and navigation

The configured locales are English (`en`), Spanish (`es`), French (`fr`), German (`de`), and Portuguese (`pt`). Add or change translation messages consistently across the locale JSON files. Shared prop and data types belong in `src/types/**`; see the [type-system guide](./type-system.md).

## Server boundaries

Keep credentials, session handling, Cognito calls, and R2 signing on the server. Client components call server actions for account changes and receive only the data needed to render the page. Values named `NEXT_PUBLIC_*` can be included in browser bundles, so they must not contain secrets.
