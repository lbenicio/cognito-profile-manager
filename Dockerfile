FROM node:26-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install all dependencies once; the builder needs devDependencies too.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

# Build the app with devDependencies. Next.js writes a standalone server containing
# only the traced runtime files and dependencies.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY . .

# NEXT_PUBLIC values are replaced at container startup by scripts/entrypoint.sh.
ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=__NEXT_PUBLIC_COGNITO_CLIENT_ID__
ENV NEXT_PUBLIC_COGNITO_WELLKNOWN=__NEXT_PUBLIC_COGNITO_WELLKNOWN__
ENV NEXT_PUBLIC_R2_PUBLIC_URL=__NEXT_PUBLIC_R2_PUBLIC_URL__
ENV NEXT_PUBLIC_OAUTH2_SCOPE=__NEXT_PUBLIC_OAUTH2_SCOPE__
ENV NEXT_PUBLIC_ADMIN_DASHBOARD_URL=__NEXT_PUBLIC_ADMIN_DASHBOARD_URL__

# Required at build time by server modules; real values are supplied at runtime.
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

RUN npm run build:pkg

# Keep only Next.js standalone output and static assets in the final image.
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/dist/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/static ./dist/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/api/v1/ping', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
