# Changelog

Notable changes to Cognito Profile Manager are documented here. This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses semantic versioning.

Historical tags are not consistently ordered by commit date. Versions are listed in descending version order, and dates refer to the tagged commit (or, for `0.4.1`, the release commit; no `v0.4.1` Git tag is present).

## [Unreleased]

### Added

- Added project contribution guidance and a code of conduct.
- Added a typed Markdown content reader that limits file access to known content files.

### Changed

- Built the production container from Next.js standalone output and its traced runtime dependencies, reducing the image size.
- Removed BuildKit-only syntax and cache mounts from both Dockerfiles.
- Changed the Docker health check to use the public ping endpoint.

## [0.4.1] - 2026-11-19

### Changed

- Consolidated shared TypeScript declarations under `src/types/**` and made the contact form data shape explicit.
- Hardened CI workflows, development authentication, and contact form validation.
- Updated dependencies, migrated the lint command to ESLint, refreshed the setup documentation, and updated Docker base images to Node.js 26.

## [0.3.111] - 2025-07-04

### Changed

- Removed Dependabot ignore rules so previously blocked dependencies can receive updates.

## [0.3.110] - 2025-07-04

### Changed

- Reformatted the codebase for consistent style and readability.

## [0.3.109] - 2025-07-04

### Changed

- Updated project dependencies.

## [0.3.108] - 2025-07-04

### Fixed

- Added dependency overrides for Radix UI and WebAssembly client packages to address installation compatibility.

## [0.3.107] - 2025-07-04

### Changed

- Upgraded `next-intl` to v4 and migrated navigation to Next.js built-in APIs.
- Updated charting, date-picker, and theme components for newer dependency versions.

## [0.3.106] - 2025-07-09

### Fixed

- Refresh Cognito tokens during authenticated activity.

### Changed

- Removed obsolete action modules from `src/lib/actions` after the actions directory was reorganized.

## [0.3.105] - 2025-07-04

### Changed

- Upgraded to Tailwind CSS v4 and migrated to its PostCSS configuration.

## [0.3.104] - 2025-07-03

### Fixed

- Corrected the casing of Upstash Redis environment variables across the app, Compose configuration, and docs.

## [0.3.103] - 2025-07-03

### Changed

- Standardized Upstash Redis environment variable names and updated Docker and configuration documentation.
- Removed obsolete cache dependencies and resolved cache client typing issues.

## [0.3.101] - 2025-07-03

### Changed

- Reused one Upstash Redis client instead of creating multiple connections.

## [0.3.100] - 2025-07-03

### Changed

- Migrated the Redis cache integration to `@upstash/redis`.

## [0.3.99] - 2025-07-03

### Changed

- Updated release metadata and dependency versions, including the Vercel KV client.

## [0.3.33] - 2025-07-02

### Added

- Added `/api/v1/health` and `/api/v1/ping` endpoints and cache health reporting.

## [0.3.32] - 2025-07-02

### Changed

- Reorganized documentation into API, architecture, contribution, deployment, and setup guides.

## [0.3.31] - 2025-07-02

### Changed

- Set the session cookie in the OIDC callback and refactored session creation.
- Moved server actions into a dedicated source directory and added authentication/session debugging logs.
- Updated core dependencies.

## [0.3.29] - 2025-07-02

### Fixed

- Kept mock logout within the development mock flow instead of calling Cognito.
- Corrected terminal color output in the logger.

## [0.3.26] - 2025-07-02

### Fixed

- Resolved TypeScript errors in URL utilities and the OIDC, passkey, and SSO routes.

## [0.3.20] - 2025-07-02

### Changed

- Standardized naming and extracted URL helpers for authentication flows.

## [0.3.19] - 2025-07-02

### Added

- Added local development setup, mock-user login, and authentication/logout smoke-check scripts.
- Documented the OAuth logout flow and authentication setup.

### Changed

- Detect the locale from request cookies and headers, and improve SSO configuration handling.

## [0.3.14] - 2025-07-02

### Fixed

- Fixed Next.js runtime and build issues across localized routes and authentication flows.

## [0.3.9] - 2025-07-02

### Added

- Expanded caching for well-known/OIDC data and added Redis, Vercel KV, and Cloudflare KV provider support.

### Changed

- Updated authentication and session actions to use the cache layer consistently.

## [0.3.7] - 2025-07-02

### Changed

- Refresh the user session when returning to the app after a period of inactivity.

## [0.3.6] - 2025-06-30

### Fixed

- Resolved build and type issues in authentication actions and logout handling.

## [0.3.3] - 2025-06-30

### Fixed

- Simplified message action handling to resolve a production build error.

## [0.3.2] - 2025-06-29

### Fixed

- Fixed a message action build error.

## [0.3.1] - 2025-06-29

### Added

- Added dashboard widgets for recent login activity and message/warning previews.

### Fixed

- Addressed Next.js runtime and production build issues.

## [0.2.7] - 2025-06-28

### Changed

- Moved helper scripts into `scripts/` and updated the documentation to match.

## [0.2.6] - 2025-06-28

### Changed

- Updated package version metadata.

## [0.2.5] - 2025-06-28

### Added

- Added a VS Code launch configuration for the development server.

## [0.2.4] - 2025-06-28

### Changed

- Updated the package-lock version metadata.

## [0.2.3] - 2025-06-28

### Changed

- Updated `dotenv`, `@hookform/resolvers`, and `nodemailer`.
- Adjusted Dependabot rules for packages with coupled or incompatible updates.

## [0.2.2] - 2025-06-28

### Changed

- Updated workflow concurrency groups and upgraded `lucide-react`.

## [0.2.1] - 2025-06-28

### Changed

- Updated release version metadata for v0.2.0.

## [0.1.23] - 2025-06-28

### Added

- Added shared type and interface definitions across the app.
- Granted the release workflow permission to publish GitHub Packages.

## [0.1.21] - 2025-06-28

### Added

- Added a structured logger and migrated application logging to it.

### Fixed

- Corrected the Docker build stage declaration.

## [0.1.19] - 2025-06-28

### Added

- Added a container entrypoint that replaces build-time public environment placeholders with runtime values.

## [0.1.18] - 2025-06-28

### Changed

- Switched dependency installation from `npm ci` to `npm install`.

## [0.1.17] - 2025-06-28

### Changed

- Moved component and toast interfaces into shared type files and adopted type-only imports.

## [0.1.13] - 2025-06-28

### Changed

- Renamed component props for consistency and clarity.

## [0.1.12] - 2025-06-28

### Fixed

- Awaited Next.js cookie access and resolved related build errors.

## [0.1.11] - 2025-06-28

### Fixed

- Corrected session handling for the updated Next.js request APIs and added typed password form state.

## [0.1.10] - 2025-06-28

### Added

- Added interface translations for additional locales and loading feedback to form submissions.

## [0.1.8] - 2025-06-28

### Fixed

- Fixed typing and Next.js async route parameter issues in authentication and locale handling.

## [0.1.7] - 2025-06-28

### Added

- Added GitHub Actions workflows for releases and publishing the container image to GHCR, with workflow permissions and concurrency controls.

## [0.1.5] - 2025-06-28

### Changed

- Audited application types and corrected locale configuration typing.

## [0.1.1] - 2025-06-28

### Added

- Initial tagged application for Cognito profile and account management, with OAuth 2.0/OIDC sign-in, TOTP MFA, WebAuthn passkeys, Cloudflare R2 uploads, localization, appearance settings, and development mock accounts.

### Fixed

- Improved authentication startup handling and added the development mock data module.
