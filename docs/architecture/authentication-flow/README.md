# Authentication flow

## Cognito OIDC sign-in

1. The browser requests `GET /api/v1/auth/sso/start`.
2. The server reads Cognito's OIDC discovery document, creates a random `state` value, stores it in an HTTP-only cookie, and redirects to the authorization endpoint.
3. Cognito returns the browser to `/api/v1/auth/callback/oidc` with an authorization code and state.
4. The callback validates the state, exchanges the code on the server, and verifies the ID token against Cognito's JWKS.
5. The app stores session data in an encrypted, HTTP-only cookie and redirects to the app.

Configure the client ID, optional client secret, discovery URL, callback URLs, and scopes using the [Cognito guide](../../guides/aws-cognito-setup.md).

## Sessions and logout

The app encrypts session data using `TOTP_SECRET_ENCRYPTION_KEY`. Use the same key across instances that need to read the same sessions, and keep the key secret. The logout handler clears the local session first; for Cognito sessions, it then attempts to redirect through the provider's logout endpoint and falls back to the local login page if that fails.

## Passkeys and TOTP

- **Passkeys:** The security page sends a signed-in user through the Cognito-hosted passkey setup route. On return, the callback updates the `custom:pless` profile flag. The app lists and deletes Cognito WebAuthn credentials through server actions.
- **TOTP:** The security page asks Cognito to associate a software token, displays its QR code, then verifies the user's code and enables the Cognito MFA preference.

See the [passkey guide](../../guides/passkey-setup.md) and [TOTP guide](../../guides/totp-setup.md) for feature setup.

## Local development

Mock user and mock admin sign-in are available only in development mode. They do not exercise Cognito or validate production authentication configuration.
