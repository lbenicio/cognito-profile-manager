# Installation Guide

This guide provides detailed steps to set up the Cognito Profile Manager for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or later. You can download it from [nodejs.org](https://nodejs.org/).
- **Package Manager**: `npm`, `yarn`, or `pnpm`. This guide will use `npm` in its examples.
- **Git**: Required to clone the repository.
- **AWS Account**: With access to Cognito to create a User Pool.
- **S3-Compatible Storage**: An AWS S3 bucket or a Cloudflare R2 bucket.

## Installation Steps

1. **Clone the Repository**

   Open your terminal and clone the project from GitHub:

   ```sh
   git clone https://github.com/lbenicio/cognito-profile-manager.git
   cd cognito-profile-manager
   ```

2. **Install Dependencies**

   Install the required Node.js packages using your preferred package manager:

   ```sh
   npm install
   ```

3. **Set Up Environment Variables**

   The project requires a set of environment variables to connect to external services like AWS Cognito and your S3-compatible storage.

   Copy the example environment file to create your local configuration:

   ```sh
   cp .env.example .env.local
   ```

   Next, you will need to edit the `.env.local` file with your specific credentials and endpoints. See the [Configuration Guide](./configuration.md) for detailed instructions on each variable.

4. **Run the Development Server**

   Once your configuration is complete, you can start the Next.js development server:

   ```sh
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

You are now ready to start developing! Any changes you make to the source code will be automatically reloaded in your browser.
