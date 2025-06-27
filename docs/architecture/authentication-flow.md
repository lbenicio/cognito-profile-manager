# Authentication Flow

The application uses the **OAuth 2.0 Authorization Code Grant** flow with **OpenID Connect (OIDC)** to authenticate users with AWS Cognito.

## Standard Login Flow

1. **Initiation**: The user clicks the "Login" button on the frontend.
2. **Redirect to Cognito**: The application redirects the user to the Cognito Hosted UI.
3. **Authentication**: The user enters their credentials (or uses a social provider) on the Cognito page.
4. **Authorization Code**: After successful authentication, Cognito redirects the user back to the `NEXT_PUBLIC_OAUTH2_CALLBACK_URL` specified in the configuration, providing an `authorization code` in the URL parameters.
5. **Token Exchange**: The Next.js API route at the callback URL receives the authorization code. It then makes a secure, server-to-server request to Cognito's token endpoint, exchanging the code for an `ID Token`, `Access Token`, and `Refresh Token`.
6. **Session Creation**: The tokens are stored securely in an encrypted, HTTP-only cookie, establishing a session for the user.
7. **User Redirect**: The user is redirected to their profile page.

## Passkey & TOTP

- **Passkey (WebAuthn)**: This flow is initiated from the user's security settings page. The backend API generates a challenge, which the frontend uses to prompt the user's device to create and register a new passkey.
- **TOTP MFA**: When a user enables TOTP, the backend generates a secret, which is displayed as a QR code. On subsequent logins, Cognito will prompt the user for a TOTP code after they enter their password.
