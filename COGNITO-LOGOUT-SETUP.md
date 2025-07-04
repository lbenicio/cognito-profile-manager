# AWS Cognito Logout Configuration Guide

This guide explains how to properly configure AWS Cognito logout URLs to fix 400 errors and ensure proper logout functionality.

## Overview

The logout flow requires proper configuration in your AWS Cognito App Client to specify where users should be redirected after logout. Without this configuration, you'll get 400 errors when users try to logout.

## Required Configuration

### Step 1: Access Cognito Console

1. Go to the [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Select your User Pool
3. Navigate to **App integration** → **App clients**
4. Select your app client (e.g., `outpost-app-client`)

### Step 2: Configure Sign out URLs

In the **App client settings** section:

1. Scroll down to **Hosted UI settings**
2. Find the **Sign out URL(s)** field
3. Add your logout redirect URLs:

**For Development:**

```
http://localhost:9002/login
```

**For Production:**

```
https://your-domain.com/login
```

**For Multiple Environments:**

```
http://localhost:9002/login,https://staging.your-domain.com/login,https://your-domain.com/login
```

### Step 3: Verify Domain Configuration

Ensure your Cognito User Pool has a domain configured:

1. Go to **App integration** → **Domain**
2. Verify you have either:
   - **Cognito domain**: `your-app-name.auth.region.amazoncognito.com`
   - **Custom domain**: `auth.your-domain.com`

### Step 4: Check OAuth 2.0 Settings

Verify these OAuth 2.0 settings in your App Client:

1. **OAuth 2.0 grant types**: ✅ Authorization code grant
2. **OAuth 2.0 scopes**:
   - ✅ `openid`
   - ✅ `email`
   - ✅ `profile`
   - ✅ `aws.cognito.signin.user.admin` (optional)

### Step 5: Callback URLs (for reference)

Also ensure your callback URLs are configured:

**For Development:**

```
http://localhost:9002/api/v1/auth/callback/oidc
```

**For Production:**

```
https://your-domain.com/api/v1/auth/callback/oidc
```

## Testing the Configuration

### Method 1: Using curl

```bash
# Test logout endpoint (should redirect to Cognito)
curl -v http://localhost:9002/api/v1/auth/logout

# Should return:
# HTTP/1.1 302 Found
# Location: https://your-domain.auth.region.amazoncognito.com/logout?client_id=XXX&logout_uri=http://localhost:9002/login
```

### Method 2: Using npm script

```bash
npm run test:logout
```

### Method 3: Browser testing

1. Start your application: `npm run dev`
2. Go to http://localhost:9002/login
3. Login with SSO
4. Click logout button
5. Should redirect to Cognito logout, then back to login page

## Common Issues and Solutions

### Issue: 400 Bad Request from Cognito

**Symptoms:**

- User clicks logout
- Gets redirected to Cognito
- Sees 400 error page
- URL shows invalid_request error

**Solution:**

- Add `http://localhost:9002/login` to Sign out URLs in Cognito App Client
- Ensure URL exactly matches (no trailing slashes, correct protocol)

### Issue: Logout doesn't work at all

**Symptoms:**

- Logout button doesn't work
- No redirect happens
- User stays logged in

**Solution:**

- Check environment variables are set correctly
- Verify `NEXT_PUBLIC_COGNITO_CLIENT_ID` is configured
- Ensure `APP_URL` matches your development URL

### Issue: Works in development but not production

**Symptoms:**

- Logout works on localhost
- Fails in production environment

**Solution:**

- Add production domain to Sign out URLs
- Update `APP_URL` environment variable for production
- Ensure HTTPS URLs for production

## Environment Variables

Ensure these are configured in your `.env` file:

```bash
# Required for logout functionality
APP_URL=http://localhost:9002
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_COGNITO_WELLKNOWN=https://cognito-idp.region.amazonaws.com/region_POOLID/.well-known/openid_configuration

# Optional: Client secret for enhanced security
COGNITO_CLIENT_SECRET=your_client_secret_here
```

## Logout Flow Diagram

```
[User clicks logout]
        ↓
[Clear local session cookies]
        ↓
[Redirect to Cognito logout URL]
https://your-domain.auth.region.amazoncognito.com/logout?client_id=XXX&logout_uri=http://localhost:9002/login
        ↓
[Cognito clears server session]
        ↓
[Cognito redirects back to logout_uri]
        ↓
[User sees login page]
```

## Verification Checklist

- [ ] Sign out URLs configured in Cognito App Client
- [ ] URLs match exactly (including protocol and port)
- [ ] Domain is configured for User Pool
- [ ] OAuth 2.0 settings are correct
- [ ] Environment variables are set
- [ ] `APP_URL` has no trailing slash
- [ ] Client ID is correct and unquoted in .env file

## Security Notes

1. **HTTPS in Production**: Always use HTTPS URLs for production Sign out URLs
2. **Exact URL Matching**: Cognito requires exact URL matches - trailing slashes matter
3. **Client Secret**: Use client secret in production for enhanced security
4. **Domain Validation**: Cognito validates redirect URLs against configured domains

## Troubleshooting Commands

```bash
# Test Cognito configuration
npm run test:cognito

# Test logout behavior
npm run test:logout

# Check environment variables
cat .env.development.local | grep -E "(APP_URL|COGNITO)"

# Test well-known endpoint
curl -s "https://cognito-idp.region.amazonaws.com/region_POOLID/.well-known/openid_configuration" | jq .
```

## Additional Resources

- [AWS Cognito Hosted UI Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
- [OAuth 2.0 Logout Best Practices](https://tools.ietf.org/html/rfc6749)
- [Cognito Domain Configuration](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-assign-domain.html)

## Support

If you continue to experience issues:

1. Check the browser network tab for exact error messages
2. Verify all URLs in Cognito App Client settings
3. Test with the provided npm scripts
4. Check server logs for detailed error information
