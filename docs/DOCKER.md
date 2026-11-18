# Docker Deployment Guide

This guide explains how to deploy the Cognito Profile Manager using Docker with proper environment variable handling.

## Overview

The Docker setup includes:

- **Multi-stage build** for optimized production images
- **Runtime environment variable injection** for `NEXT_PUBLIC_*` variables
- **Placeholder replacement** during container startup
- **Health checks** and proper logging
- **Development and production** configurations

## Quick Start

### 1. Prerequisites

- Docker and Docker Compose installed
- AWS Cognito User Pool configured
- Cloudflare R2 bucket (or S3-compatible storage)
- Upstash Redis instance for caching

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Required: Your application URL
APP_URL=https://yourapp.com

# Required: Cognito settings
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
COGNITO_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_COGNITO_WELLKNOWN=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/openid-configuration

# Required: Encryption key (generate with: openssl rand -base64 32)
TOTP_SECRET_ENCRYPTION_KEY=your-32-byte-base64-key

# Required: Caching provider
CACHE_PROVIDER=upstash
UPSTASH_KV_REST_API_URL=your-upstash-rest-api-url
UPSTASH_KV_REST_API_TOKEN=your-upstash-rest-api-token


# Required: AWS and R2 settings
AWS_REGION=us-east-1
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com

# Additional settings...
```

### 3. Using the Helper Script

The included `scripts/docker-run.sh` script simplifies Docker operations:

```bash
# Build the image
./scripts/docker-run.sh build

# Run in development mode
./scripts/docker-run.sh dev

# Run in production mode
./scripts/docker-run.sh prod

# Run standalone container
./scripts/docker-run.sh run

# View logs
./scripts/docker-run.sh logs

# Stop container
./scripts/docker-run.sh stop
```

### 4. Manual Docker Commands

#### Production Build and Run

```bash
# Build the production image
docker build -t cognito-profile-manager .

# Run the container
docker run -d \
  --name cognito-profile-manager \
  --env-file .env.local \
  -p 3000:3000 \
  cognito-profile-manager
```

#### Development with Docker Compose

```bash
# Start development environment
npm run setup:dev
docker-compose --profile dev up --build

# Start production environment
docker-compose --profile prod up --build
```

## Environment Variable Handling

### Build-time vs Runtime

The Docker setup handles two types of environment variables differently:

#### 1. `NEXT_PUBLIC_*` Variables (Client-side)

These variables are embedded in the client-side JavaScript bundle and need special handling:

- **Build time**: Placeholder values are used (e.g., `__NEXT_PUBLIC_COGNITO_CLIENT_ID__`)
- **Runtime**: The `scripts/entrypoint.sh` script replaces placeholders with actual values

**Supported variables:**

- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_WELLKNOWN`
- `NEXT_PUBLIC_R2_PUBLIC_URL`
- `NEXT_PUBLIC_OAUTH2_SCOPE`
- `NEXT_PUBLIC_ADMIN_DASHBOARD_URL`

#### 2. Server-side Variables

These are handled normally by Node.js at runtime:

- `APP_URL`
- `TOTP_SECRET_ENCRYPTION_KEY`
- `COGNITO_CLIENT_SECRET`
- `AWS_REGION`
- `R2_*` secrets
- `SMTP_*` settings
- `UPSTASH_KV_REST_API_URL`
- `UPSTASH_KV_REST_API_TOKEN`

### Security Considerations

1. **Never build secrets into images**: Server-side secrets are injected at runtime
2. **Use Docker secrets**: For production, consider using Docker secrets or external secret management
3. **Environment file permissions**: Ensure `.env.local` has restricted permissions (600)

## Production Deployment

### 1. Container Orchestration

#### Docker Swarm

```yaml
# docker-stack.yml
version: '3.8'
services:
  app:
    image: cognito-profile-manager:latest
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      APP_URL: https://yourapp.com
      # ... other non-secret vars
    secrets:
      - cognito_client_secret
      - totp_encryption_key
      - r2_secret_key
      - upstash_kv_rest_api_token
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

secrets:
  cognito_client_secret:
    external: true
  totp_encryption_key:
    external: true
  r2_secret_key:
    external: true
  upstash_kv_rest_api_token:
    external: true
```

#### Kubernetes

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cognito-profile-manager
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cognito-profile-manager
  template:
    metadata:
      labels:
        app: cognito-profile-manager
    spec:
      containers:
        - name: app
          image: cognito-profile-manager:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: APP_URL
              value: 'https://yourapp.com'
            - name: COGNITO_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: cognito-client-secret
            - name: UPSTASH_KV_REST_API_TOKEN
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: upstash-kv-rest-api-token
          # ... other environment variables
          resources:
            limits:
              memory: '512Mi'
              cpu: '500m'
            requests:
              memory: '256Mi'
              cpu: '100m'
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 2. Reverse Proxy Setup

#### Nginx

```nginx
# nginx.conf
upstream app {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourapp.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Traefik

```yaml
# docker-compose.yml with Traefik
version: '3.8'
services:
  app:
    image: cognito-profile-manager:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.app.rule=Host(`yourapp.com`)'
      - 'traefik.http.routers.app.tls.certresolver=letsencrypt'
      - 'traefik.http.services.app.loadbalancer.server.port=3000'
    environment:
      # ... your environment variables
```

## Monitoring and Logging

### Health Checks

The container includes built-in health checks:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' cognito-profile-manager

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' cognito-profile-manager
```

### Logging

```bash
# View real-time logs
docker logs -f cognito-profile-manager

# View logs with timestamps
docker logs -t cognito-profile-manager

# View last 100 lines
docker logs --tail 100 cognito-profile-manager
```

### Metrics Collection

For production monitoring, consider:

1. **Prometheus metrics**: Add a metrics endpoint to the Next.js app
2. **Container metrics**: Use cAdvisor or similar tools
3. **Log aggregation**: Use ELK stack, Fluentd, or cloud logging services

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Applied

**Symptoms**: App shows placeholder values or errors about missing config

**Solutions**:

- Check that `.env.local` exists and has correct values
- Verify file permissions on environment file
- Check container logs for environment injection messages

```bash
# Debug environment variables in running container
docker exec cognito-profile-manager env | grep -E "(NEXT_PUBLIC_|APP_URL)"
```

#### 2. Build Failures

**Symptoms**: Docker build fails during npm install or build

**Solutions**:

- Clear Docker build cache: `docker build --no-cache`
- Check Node.js version compatibility
- Verify package.json and dependencies

#### 3. Container Won't Start

**Symptoms**: Container exits immediately or fails health checks

**Solutions**:

- Check logs: `docker logs cognito-profile-manager`
- Verify critical environment variables are set
- Test with minimal configuration first

#### 4. Performance Issues

**Symptoms**: Slow response times or high memory usage

**Solutions**:

- Monitor resource usage: `docker stats cognito-profile-manager`
- Increase container memory limits
- Check for memory leaks in logs

### Debug Mode

Run container with debug output:

```bash
docker run -it --rm \
  --env-file .env.local \
  -e LOG_LEVEL=DEBUG \
  -p 3000:3000 \
  cognito-profile-manager
```

### Accessing Container Shell

```bash
# Open shell in running container
docker exec -it cognito-profile-manager /bin/sh

# Run one-off commands
docker exec cognito-profile-manager node --version
docker exec cognito-profile-manager npm list
```

## Security Best Practices

1. **Use specific image tags**: Don't use `latest` in production
2. **Scan images**: Use `docker scout` or similar tools
3. **Run as non-root**: The Dockerfile already configures this
4. **Network isolation**: Use Docker networks to isolate containers
5. **Secret management**: Use external secret stores in production
6. **Regular updates**: Keep base images and dependencies updated

## Performance Optimization

1. **Multi-stage builds**: Already implemented to reduce image size
2. **Layer caching**: Order Dockerfile commands for optimal caching
3. **Resource limits**: Set appropriate CPU and memory limits
4. **CDN**: Use a CDN for static assets (images, CSS, JS)

## Backup and Recovery

### Data to Backup

- Environment configuration files
- User-uploaded assets (R2/S3 bucket)
- Session data from Upstash Redis

### Backup Strategy

```bash
# Backup environment files
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env.* *.yml

# Backup Redis data (if using Upstash, use their backup tools)
```

## Support

For issues related to Docker deployment:

1. Check the [main documentation](../README.md)
2. Review [configuration guide](getting-started/configuration/README.md)
3. Open an issue on the [GitHub repository](https://github.com/lbenicio/cognito-profile-manager/issues)

---

## Appendix

### Complete Example Files

#### `.env.local` Example

```bash
# Application
NODE_ENV=production
APP_URL=https://myapp.example.com
# Generate a unique key with: openssl rand -base64 32
TOTP_SECRET_ENCRYPTION_KEY=replace-with-your-generated-key

# Cognito
NEXT_PUBLIC_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
COGNITO_CLIENT_SECRET=your-cognito-client-secret
NEXT_PUBLIC_COGNITO_WELLKNOWN=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX/.well-known/openid_configuration

# AWS
AWS_REGION=us-east-1

# R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=myapp-assets
NEXT_PUBLIC_R2_PUBLIC_URL=https://myapp-assets.your-account.r2.cloudflarestorage.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@example.com
CONTACT_FORM_TO_EMAIL=contact@example.com

# Optional
CACHE_PROVIDER=upstash
UPSTASH_KV_REST_API_URL=https://your-upstash-instance.upstash.io
UPSTASH_KV_REST_API_TOKEN=your-upstash-token
LOG_LEVEL=INFO
```

#### Production `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    env_file: .env.local
    restart: unless-stopped
    healthcheck:
      test:
        [
          'CMD',
          'node',
          '-e',
          "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

This completes the Docker deployment guide for the Cognito Profile Manager.
