# TOTP multi-factor authentication

The app uses Cognito software-token MFA. An authenticated user can enroll an authenticator app from the **Security** page.

## Requirements

- Sign in with a real Cognito account; local mock data does not enroll a provider credential.
- Configure the user pool to allow software-token MFA.
- Set `AWS_REGION` and Cognito client configuration for the app.

## Enroll an authenticator

1. Open **Security** and choose the TOTP setup action.
2. Scan the displayed QR code with an authenticator app, or enter the displayed secret manually.
3. Enter the current one-time code.
4. The app verifies the code with Cognito and enables the software-token MFA preference.

Keep the enrollment secret private. If setup fails, check the system clock on the authenticator device and enter a fresh code. To turn MFA off, use the disable action on the Security page; Cognito updates the user's MFA preference.

See [Cognito setup](./aws-cognito-setup.md) and the [environment reference](../getting-started/configuration.md) for provider configuration.
