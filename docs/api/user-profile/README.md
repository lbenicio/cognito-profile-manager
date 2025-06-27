# User Profile Endpoints

These endpoints are used to read and write data for the currently authenticated user. All endpoints in this section require a valid session cookie to be sent with the request.

---

## `GET /api/v1/user/profile`

Retrieves the complete profile of the currently logged-in user. The data is sourced from the ID token stored in the session.

- **Request**: No request body or parameters.
- **Response**:
  - `200 OK`: On success, returns a JSON object with the user's profile data.
  - `401 Unauthorized`: If the user is not authenticated.

- **Example Response Body**:

    ```json
    {
      "sub": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "cognito:groups": ["admin", "beta-testers"],
      "email_verified": true,
      "iss": "https://cognito-idp.sa-east-1.amazonaws.com/sa-east-1_ZVyk86rX4",
      "cognito:username": "lbenicio",
      "given_name": "Luan",
      "family_name": "Benicio",
      "email": "hi@lbenicio.dev",
      "picture": "https://outpost-users-assets.4686189.xyz/a1b2c3d4.jpg",
      "custom:profession": "Software Engineer",
      "custom:company": "ACME Corp",
      "custom:country": "Brazil",
      "custom:mfa": false,
      "custom:pless": true,
      "custom:balance": 500.75
    }
    ```

---

### `PUT /api/v1/user/profile`

Updates one or more attributes for the currently logged-in user in the AWS Cognito User Pool.

- **Request Body**: A JSON object containing the attributes to update. Only include the fields that need to be changed.

- **Example Request Body**:

    ```json
    {
      "given_name": "Luan",
      "family_name": "Benicio",
      "custom:profession": "Lead Software Engineer",
      "custom:aboutme": "A developer passionate about open source."
    }
    ```

- **Response**:
  - `200 OK`: On success, returns a JSON object with a success message.

    ```json
    {
      "message": "Profile updated successfully."
    }
    ```

  - `400 Bad Request`: If the request body is malformed or contains invalid data.
  - `401 Unauthorized`: If the user is not authenticated.
  - `500 Internal Server Error`: If the update operation fails on the server.
