# Guide: Setting up AWS Cognito

To use this application, you need a properly configured AWS Cognito User Pool.

## Steps

1. **Create a User Pool**:
   - Navigate to the Cognito service in the AWS Console.
   - Click "Create user pool".
   - Choose your desired sign-in options (e.g., email, username).
   - Configure your password policy and MFA settings.
   - Complete the pool creation process. Note the **User Pool ID**.

2. **Configure an App Client**:
   - In your new User Pool, go to the "App integration" tab.
   - Under "App clients", click "Create an app client".
   - Choose "Public client" or "Confidential client". For this project, a **Confidential client** is recommended as it allows for a client secret.
   - Give it a name (e.g., `cognito-profile-manager-app`).
   - **Generate a client secret**.
   - Under "Allowed callback URLs", add your callback URL (e.g., `http://localhost:3000/api/v1/auth/callback/oidc`).
   - Under "Allowed sign-out URLs", add your sign-out URL (e.g., `http://localhost:3000`).
   - In "Allowed OAuth Flows", check **Authorization code grant**.
   - In "Allowed OAuth Scopes", check `email`, `openid`, and `profile`. If you need to manage users, also add `aws.cognito.signin.user.admin`.
   - Create the app client. Note the **Client ID** and **Client secret**.

3. **Configure a Domain**:
   - In the "App integration" tab, configure a domain name for the Hosted UI. You can use a Cognito domain or a custom domain.

4. **Update `.env.local`**:
   - Use the User Pool ID, Client ID, Client Secret, and Domain to fill the Cognito-related variables in your `.env.local` file.
