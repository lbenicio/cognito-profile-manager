# Deployment

The application can run as a Node.js Next.js server or in the provided Docker image. Configure the environment before starting a production instance.

- [Docker and Compose](./docker.md): local container development and production deployment.
- [Vercel](./vercel.md): project setup and required environment configuration.
- [Environment reference](../getting-started/configuration.md): required and optional variables.

Node.js 26 LTS is recommended; the package engine currently allows Node.js 22 or later. Keep encryption keys, client secrets, storage credentials, and cache tokens in the hosting platform's secret settings. Do not commit production environment files.
