# Configure AWS Cognito

Real sign-in uses Cognito's OIDC authorization-code flow. Development mock accounts work without a user pool.

## Configure the user pool and app client

1. Create or select a Cognito user pool and configure its sign-in options.
2. Configure a user-pool domain so Cognito can serve its hosted authorization flow.
3. Create an app client that allows the authorization code grant. A client secret is optional; if you configure one, set `COGNITO_CLIENT_SECRET` on the server.
4. Add the required callback URLs to the app client's allowed callback URLs:

   ```text
   http://localhost:3000/api/v1/auth/callback/oidc
   http://localhost:3000/api/v1/auth/callback/passkey
   https://your-domain.example/api/v1/auth/callback/oidc
   https://your-domain.example/api/v1/auth/callback/passkey
   ```

   Add only URLs for environments you operate. Cognito requires an exact match.

5. Add the local and production `/login` URLs to allowed sign-out URLs.
6. Enable the scopes the app requests. The default is `openid email profile aws.cognito.signin.user.admin`.

## Configure the app

Set these variables in the app environment:

```dotenv
AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_COGNITO_WELLKNOWN=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example/.well-known/openid_configuration
NEXT_PUBLIC_OAUTH2_SCOPE=openid email profile aws.cognito.signin.user.admin
```

For a confidential app client, also set `COGNITO_CLIENT_SECRET`. The discovery URL has the form:

```text
https://cognito-idp.<region>.amazonaws.com/<user-pool-id>/.well-known/openid_configuration
```

For local HTTP, set `APP_URL=http://localhost:3000` and `NO_HTTPS=true`. In production, use the public HTTPS origin for `APP_URL` and leave `NO_HTTPS` unset. Restart the app after changing environment values.

See the [configuration reference](../getting-started/configuration.md) and [authentication flow](../architecture/authentication-flow/README.md) for session and logout behavior.
