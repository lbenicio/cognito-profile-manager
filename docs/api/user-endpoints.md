# User operations

There are currently no public `/api/v1/user/*` REST routes. The profile and account interface uses Next.js Server Actions in `src/actions/` to read or update the signed-in user's Cognito attributes.

The HTTP route inventory is maintained in the [API reference](./README.md). For the server-side boundary and source layout, see [Backend and HTTP routes](../architecture/backend-api.md).
