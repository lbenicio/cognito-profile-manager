# Deploy to Vercel

The project uses the Next.js App Router and can be deployed as a Vercel Next.js project.

## Configure the project

1. Import the Git repository into Vercel and select the project root.
2. Set the Node.js runtime to 26 LTS.
3. Use `npm run build:pkg` as the build command. Vercel can detect the Next.js output.
4. Add environment variables for each environment in Vercel's project settings.

## Environment variables

Set `AWS_REGION` and `TOTP_SECRET_ENCRYPTION_KEY` for the app runtime. For real Cognito sign-in, also set `NEXT_PUBLIC_COGNITO_CLIENT_ID` and `NEXT_PUBLIC_COGNITO_WELLKNOWN`; configure `COGNITO_CLIENT_SECRET` if the app client uses one. Set `APP_URL` to the deployment's public origin.

Set `NEXT_PUBLIC_OAUTH2_SCOPE` if you need to override the default scopes. Add R2 variables for image uploads, SMTP variables for contact email, and Upstash variables if you want remote caching. The complete variable list is in the [configuration reference](../getting-started/configuration.md).

`NEXT_PUBLIC_*` values are embedded into browser code during the build. If they change, create a new deployment. Never place a secret in a `NEXT_PUBLIC_*` variable.

## Cognito URLs

Add the deployment's exact URLs to the Cognito app client:

- `<deployment-origin>/api/v1/auth/callback/oidc`
- `<deployment-origin>/api/v1/auth/callback/passkey`
- `<deployment-origin>/login` as an allowed sign-out URL

Use the stable production domain for production settings. Do not enable `NO_HTTPS` on a public HTTPS deployment.
