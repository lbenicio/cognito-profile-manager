# Setup guides

- [AWS Cognito](./aws-cognito-setup.md): configure OIDC sign-in, callback URLs, and logout URLs.
- [Passkeys](./passkey-setup.md): use Cognito WebAuthn credential management from the security page.
- [TOTP MFA](./totp-setup.md): enable an authenticator app for a Cognito user.
- [Cloudflare R2 uploads](./storage-setup.md): configure avatar and banner storage.

All local settings belong in the ignored `.env.development.local` file. See the [environment reference](../getting-started/configuration.md) for variable names and defaults.
