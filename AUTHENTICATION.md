# Authentication Setup Guide

This guide explains how to configure authentication for the Cognito Profile Manager application.

## Overview

The application supports two authentication modes:

1. **Production Mode**: AWS Cognito OAuth2/OIDC authentication
2. **Development Mode**: Mock authentication with test data

## Development Mode (Mock Authentication)

In development mode (`NODE_ENV=development`), you can use mock authentication to bypass AWS Cognito and test with predefined user data.

### Mock Login Options

- **Admin User**: Full administrative access with mock admin data
- **Regular User**: Standard user access with mock user data

Both options use client-side navigation and populate the session with comprehensive mock data from `src/lib/mock-data.ts`.

### How It Works

1. Click "Admin" or "User" button on login page
2. Mock session is created with test data
3. User is navigated directly to home page (no redirect)
4. All user data comes from mock objects

## Production Mode (AWS Cognito)

For production, the application uses AWS Cognito with OAuth2/OIDC flow.

### AWS Cognito Setup

#### 1. Create User Pool

1. Go to AWS Cognito console
2. Create a new User Pool
3. Configure sign-in options (email, username, etc.)
4. Set password policies and MFA settings
5. Note your User Pool ID (format: `us-east-1_XXXXXXXXX`)

#### 2. Create App Client

1. In your User Pool, go to "App clients"
2. Create a new App client with these settings:
   - **App client name**: `outpost-app-client`
   - **Generate client secret**: ✅ Yes
   - **Authentication flows**: Allow all flows
   - **OAuth 2.0 grant types**: Authorization code grant
   - **OAuth 2.0 scopes**: 
     - `openid`
     - `email` 
     - `profile`
     - `aws.cognito.signin.user.admin`
   - **Callback URLs**: `{YOUR_APP_URL}/api/v1/auth/callback/oidc`
   - **Sign out URLs**: `{YOUR_APP_URL}/login`

3. Note your Client ID and Client Secret

#### 3. Configure Domain

1. Go to "App client settings" → "Domain"
2. Either:
   - Use Cognito domain: `your-app-name.auth.us-east-1.amazoncognito.com`
   - Or configure custom domain

#### 4. Create User Groups (Optional)

1. Go to "Groups" in your User Pool
2. Create groups like:
   - `users` (default group)
   - `admins` (for administrative access)
   - `beta-testers`, etc.

### Environment Configuration

Copy `.env.template` to `.env.local` and configure:

```bash
# Application
APP_URL=http://localhost:9002
NODE_ENV=development

# AWS Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id_here
COGNITO_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_COGNITO_WELLKNOWN=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/openid_configuration
NEXT_PUBLIC_OAUTH2_SCOPE=openid email profile aws.cognito.signin.user.admin
AWS_REGION=us-east-1

# Session encryption (generate with: npm run generate:key)
TOTP_SECRET_ENCRYPTION_KEY=your_base64_key_here

# Groups
COGNITO_ADMIN_GROUP_NAME=admins
COGNITO_GROUPS_CLAIM_KEY=cognito:groups
```

### Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
npm run generate:key
```

Copy the generated key to your `TOTP_SECRET_ENCRYPTION_KEY` environment variable.

## Authentication Flow

### Development Flow

```
Login Page → Mock Login Button → Client Navigation → Home Page
```

1. User clicks "Admin" or "User" button
2. Mock session created with test data
3. Client-side navigation to home page
4. No server redirects involved

### Production Flow

```
Login Page → SSO Start → Cognito → Callback → Home Page
```

1. User clicks "Sign In with SSO"
2. Redirected to `/api/v1/auth/sso/start`
3. Server builds OAuth2 authorization URL
4. User redirected to Cognito login
5. User authenticates with Cognito
6. Cognito redirects back to `/api/v1/auth/callback/oidc`
7. Server exchanges authorization code for tokens
8. JWT tokens verified and session created
9. User redirected to home page

## Session Management

### Session Storage

- **Development**: Sessions stored in encrypted cookies
- **Production**: Sessions stored in Redis/KV with session ID in encrypted cookie

### Session Duration

- **Mock sessions**: 7 days
- **Production sessions**: 30 days with automatic token refresh

### Token Refresh

Production sessions automatically refresh access tokens when they expire (5 minutes before expiry) using the refresh token.

### Logout Behavior

The application performs **proper OAuth2 logout** for both mock and real sessions:

**Mock Sessions (Development)**:
- Clears local session cookies only
- Redirects directly to login page
- No external API calls

**Real OAuth2 Sessions (Production)**:
- Clears local session cookies first
- Redirects user to AWS Cognito logout endpoint
- Uses `logout_uri` parameter for proper session termination
- Cognito clears server-side session and cookies
- Cognito redirects user back to login page
- Ensures complete session termination on both client and server

**Logout Flow**:
```
User clicks logout → Clear local session → Redirect to Cognito logout → Cognito clears session → Redirect to login page
```

**Benefits**:
- Complete session termination on both client and server
- Proper OAuth2 logout flow compliance
- Handles Cognito session cookies and server state
- Clean logout with full security guarantees

**Required Configuration**: 
- Add `http://localhost:9002/login` (and your production URL) as allowed **Sign out URLs** in your Cognito App Client settings
- Ensure the logout endpoint URL is properly configured in your User Pool domain

## Security Features

### CSRF Protection

OAuth2 `state` parameter used for CSRF protection during authentication flow.

### Session Encryption

All session data encrypted using AES-256-GCM with server-side secret key.

### Secure Cookies

- `httpOnly`: Prevents JavaScript access
- `secure`: HTTPS only in production
- `sameSite`: CSRF protection

## Troubleshooting

### Common Issues

1. **"SSO client configuration is missing"**
   - Check `NEXT_PUBLIC_COGNITO_CLIENT_ID` is set
   - Verify client ID is correct

2. **"Missing APP_URL env var"**
   - Set `APP_URL` environment variable
   - Remove trailing slash from URL

3. **"Invalid state" error**
   - Usually caused by expired or tampered session
   - Clear cookies and try again
   - Check clock synchronization

4. **Token exchange failed**
   - Verify `COGNITO_CLIENT_SECRET` is correct
   - Check callback URL matches Cognito configuration
   - Ensure OAuth2 scopes are properly configured

5. **Well-known configuration failed**
   - Check `NEXT_PUBLIC_COGNITO_WELLKNOWN` URL
   - Verify User Pool ID in URL is correct
   - Test URL in browser (should return JSON)

### Debug Mode

Set `NODE_ENV=development` to enable:
- Mock login options
- Detailed error messages
- Debug logging

### Verifying Configuration

Test your well-known URL in browser:
```
https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/openid_configuration
```

Should return JSON with endpoints like:
- `authorization_endpoint`
- `token_endpoint`
- `userinfo_endpoint`
- `jwks_uri`

## Migration Notes

### From Redirect to Navigation

The development mock login has been updated to use client-side navigation instead of server redirects:

- **Before**: Server action with `redirect('/')`
- **After**: Server action returns `{success: true, redirectTo: '/'}`, client handles navigation

This provides better user experience and allows for loading states and error handling.

### Mock Data Enhancement

Mock sessions now include comprehensive user claims matching production JWT structure for better development-production parity.

## API Reference

### Auth Actions

- `ssoLogin()`: Initiates OAuth2 flow
- `devAdminLogin()`: Creates admin mock session (dev only)  
- `devUserLogin()`: Creates user mock session (dev only)
- `localLogout()`: Clears session and redirects to login

### API Routes

- `GET /api/v1/auth/sso/start`: Start OAuth2 flow
- `GET /api/v1/auth/callback/oidc`: Handle OAuth2 callback
- `POST /api/v1/auth/logout`: Handle logout

### Session Functions

- `getSession()`: Get current session data
- `createSession(data)`: Create new session
- `deleteSession()`: Clear session
- `updateSession(id, data)`: Update existing session