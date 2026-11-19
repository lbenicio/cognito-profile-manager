# Stage 1: Install production dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package manager files
COPY package.json package-lock.json* ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Stage 2: Build the application with placeholder environment variables
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set placeholder values for NEXT_PUBLIC_ variables during build
# These will be replaced at runtime by the entrypoint script
ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=__NEXT_PUBLIC_COGNITO_CLIENT_ID__
ENV NEXT_PUBLIC_COGNITO_WELLKNOWN=__NEXT_PUBLIC_COGNITO_WELLKNOWN__
ENV NEXT_PUBLIC_R2_PUBLIC_URL=__NEXT_PUBLIC_R2_PUBLIC_URL__
ENV NEXT_PUBLIC_OAUTH2_SCOPE=__NEXT_PUBLIC_OAUTH2_SCOPE__
ENV NEXT_PUBLIC_ADMIN_DASHBOARD_URL=__NEXT_PUBLIC_ADMIN_DASHBOARD_URL__

# Set placeholder values for server-side variables required during build
ENV TOTP_SECRET_ENCRYPTION_KEY=__TOTP_SECRET_ENCRYPTION_KEY__
ENV APP_URL=__APP_URL__
ENV COGNITO_CLIENT_SECRET=__COGNITO_CLIENT_SECRET__
ENV AWS_REGION=__AWS_REGION__
ENV R2_ACCOUNT_ID=__R2_ACCOUNT_ID__
ENV R2_ACCESS_KEY_ID=__R2_ACCESS_KEY_ID__
ENV R2_SECRET_ACCESS_KEY=__R2_SECRET_ACCESS_KEY__
ENV R2_BUCKET_NAME=__R2_BUCKET_NAME__
ENV COGNITO_ADMIN_GROUP_NAME=__COGNITO_ADMIN_GROUP_NAME__
ENV COGNITO_GROUPS_CLAIM_KEY=__COGNITO_GROUPS_CLAIM_KEY__

# Build the application
RUN npm run build:pkg

# Stage 3: Production dependencies only
FROM node:22-alpine AS production-deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 4: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src/i18n ./src/i18n
COPY package.json ./

# Copy and setup entrypoint script
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Use entrypoint script to handle environment variable injection
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
