# Architecture

The app is a Next.js App Router application. UI pages and React components are under `src/app` and `src/components`; authenticated mutations use server actions; a small set of route handlers supports authentication redirects and operational checks.

- [Overview](./overview/README.md): runtime components and source layout.
- [Frontend](./frontend.md): page, component, and translation organization.
- [Backend and route handlers](./backend-api.md): server actions and HTTP routes.
- [Authentication flow](./authentication-flow/README.md): Cognito OIDC, sessions, logout, and development mock login.
- [Type system](./type-system.md): shared types under `src/types/**`.
- [Logging](./logging.md): logger API and configuration.
