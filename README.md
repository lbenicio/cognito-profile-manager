# Cognito Profile Manager

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Issues](https://img.shields.io/github/issues/lbenicio/cognito-profile-manager)](https://github.com/lbenicio/cognito-profile-manager/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/lbenicio/cognito-profile-manager)](https://github.com/lbenicio/cognito-profile-manager/pulls)

A modern, secure, and feature-rich profile management application for AWS Cognito, built with Next.js. This project provides a user-facing interface for managing profile details, security settings, and more.

## ✨ Features

- **AWS Cognito Integration**: Full integration with AWS Cognito for user authentication and management.
- **OAuth2/OIDC Support**: Secure authentication using the OAuth2 and OpenID Connect protocols.
- **Passkey Authentication**: Support for modern, passwordless authentication using Passkeys (WebAuthn).
- **TOTP Multi-Factor Authentication**: Users can enable and manage Time-based One-Time Passwords for added security.
- **Admin Integration**: Connects to an external admin dashboard.
- **S3-Compatible Storage**: Uses Cloudflare R2 for storing user assets like profile pictures.
- **Secure by Design**: Follows security best practices, with a clear policy for reporting vulnerabilities.

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- An AWS account with a configured Cognito User Pool.
- An S3-compatible object storage bucket (e.g., AWS S3 or Cloudflare R2).

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/lbenicio/cognito-profile-manager.git
   cd cognito-profile-manager
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root of the project by copying the example file:

   ```sh
   cp .env.example .env.local
   ```

   Now, fill in the values in `.env.local` with your specific configuration from AWS Cognito, R2, etc.

4. **Run the development server:**

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚙️ Configuration

All necessary environment variables are documented in the `.env.example` file. These include settings for your Cognito User Pool, client credentials, and S3-compatible storage.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [contribution guidelines](./.github/pull_request_template.md) and [issue template](./.github/issue_template.md) before getting started.

## 🛡️ Security Policy

We take security seriously. If you discover a security vulnerability, please follow our [Security Policy](./SECURITY.md) to report it.

## 📄 License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE.md](./LICENSE.md) file for details.
