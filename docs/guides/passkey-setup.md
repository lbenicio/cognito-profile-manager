# Passkeys

Passkey support is provided through AWS Cognito WebAuthn credential operations. The app does not implement the browser WebAuthn registration ceremony itself; Cognito handles the provider flow.

## Before using the feature

- Configure Cognito for the user pool's WebAuthn/passkey capabilities.
- Configure the `NEXT_PUBLIC_COGNITO_CLIENT_ID` and `NEXT_PUBLIC_COGNITO_WELLKNOWN` values.
- Register `/api/v1/auth/callback/passkey` as an allowed callback URL in the app client.
- Sign in with a real Cognito account. The mock account's sample devices are not real credentials.

## Add or remove a credential

1. Open **Security** while signed in.
2. Choose **Add passkey**. The app redirects to the Cognito-hosted setup flow.
3. Complete the provider and browser prompts. Cognito returns to the app's passkey callback.
4. To remove a credential, choose its delete action in the passkey list and confirm.

The callback updates the Cognito `custom:pless` attribute after a successful return. The security page lists and deletes credentials using Cognito's WebAuthn APIs. Availability depends on the user pool configuration and the browser/device.

For Cognito settings and callback URLs, see [AWS Cognito setup](./aws-cognito-setup.md). For app-specific environment variables, see [Configuration](../getting-started/configuration.md).
