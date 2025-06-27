# Architecture Overview

This project is a modern web application built with Next.js, designed to provide a user profile management interface for an AWS Cognito backend.

## Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Authentication**: [AWS Cognito](https://aws.amazon.com/cognito/) using OAuth2/OIDC
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **File Storage**: S3-compatible object storage (e.g., Cloudflare R2, AWS S3)
- **Deployment**: Vercel, Docker, or any Node.js hosting.

## System Diagram

The system consists of three main parts:

1. **Frontend (Next.js)**: A server-side rendered React application that the user interacts with. It handles displaying the profile, security settings, and user actions.
2. **Backend API (Next.js API Routes)**: A set of serverless functions responsible for communicating securely with AWS Cognito and the S3-compatible storage. These routes handle sensitive operations like token exchange and file uploads.
3. **External Services**:
    - **AWS Cognito**: The source of truth for user identity, authentication, and user data.
    - **Cloudflare R2 / S3**: Stores user-generated assets like profile pictures.

```text
+----------------+      +------------------------+      +-----------------+
| User's Browser | <--> |  Next.js Application   | <--> |   AWS Cognito   |
+----------------+      | (Frontend + API Routes)|      +-----------------+
                        +------------------------+
                                   ^
                                   |
                                   v
                        +------------------------+
                        | S3-Compatible Storage  |
                        | (e.g., Cloudflare R2)  |
                        +------------------------+
```
