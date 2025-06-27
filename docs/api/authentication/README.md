# Authentication Endpoints

These API routes manage the user authentication lifecycle using the OAuth2/OIDC flow with AWS Cognito.

---

## `GET /api/v1/auth/login`

Initiates the login process. This endpoint constructs the appropriate URL and redirects the user to the AWS Cognito Hosted UI for authentication.

- **Request**: No request body or parameters.
- **Response**:
  - `302 Found`: A redirect to the Cognito authentication page.

---

## `GET /api/v1/auth/callback/oidc`

The callback URL that Cognito redirects to after a user successfully authenticates. This endpoint performs the critical server-side step of exchanging the received authorization `code` for JWTs (ID, Access, and Refresh tokens). It then establishes a session by storing the tokens in a secure, encrypted, HTTP-only cookie.

This endpoint is not intended to be called directly by a client application.

- **Query Parameters**:
  - `code` (string, required): The authorization code provided by Cognito.
- **Response**:
  - `302 Found`: A redirect to the user's profile page (e.g., `/profile`) upon successful token exchange and session creation.
  - `400 Bad Request`: If the `code` is missing or invalid.
  - `500 Internal Server Error`: If the token exchange with Cognito fails.

---

## `GET /api/v1/auth/logout`

Logs the user out of the application. This involves clearing the session cookie and redirecting the user to the Cognito logout endpoint to invalidate the session on the provider's side.

- **Request**: No request body or parameters.
- **Response**:
  - `302 Found`: A redirect to the Cognito logout page, which will then redirect back to the application's home page.
