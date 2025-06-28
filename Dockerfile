# Stage 1: Install production dependencies
# This stage creates a minimal node_modules directory with only production dependencies.
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package manager files
COPY package.json package-lock.json* ./

# --- Dependency Purging ---
# Install ONLY production dependencies. This is key to a smaller image.
RUN npm ci


# Stage 2: Build the application
# This stage builds the Next.js app without the standalone output.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy the pruned node_modules from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# --- Modify next.config.ts ---
# Remove the 'output: "standalone"' line from the config file.
# This ensures the build runs in the standard mode.
RUN sed -i "/output: \"standalone\"/d" next.config.ts

# Run the build script. This will generate the production app in the `dist` directory.
RUN npm run build:pkg

FROM deps AS productiondeps

RUN npm ci --omit=dev

# Stage 3: Production Runner
# This is the final, minimal image. It's built from a clean base and only
# includes the essential files needed to run the app.
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production for performance and security
ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the essential files from previous stages
COPY --from=productiondeps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY package.json .

# Copy entrypoint script for runtime env injection
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Change ownership of the application files to the non-root user
RUN chown -R nextjs:nodejs .

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# The command to start the Next.js production server.
# It uses the `next start` command, which is the standard way to run a
# Next.js app built without the standalone output.
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
