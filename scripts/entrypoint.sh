#!/bin/sh

# entrypoint.sh - Runtime environment variable injection for Next.js
# This script replaces placeholder values in Next.js static files with actual environment variables

set -e

echo "🚀 Starting Cognito Profile Manager..."

# Define environment variables that need runtime injection
# NEXT_PUBLIC_ variables are embedded in client-side code and need special handling
PUBLIC_ENV_VARS="
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_WELLKNOWN
NEXT_PUBLIC_R2_PUBLIC_URL
NEXT_PUBLIC_OAUTH2_SCOPE
NEXT_PUBLIC_ADMIN_DASHBOARD_URL
"

# Server-side variables that also need placeholder replacement
SERVER_ENV_VARS="
TOTP_SECRET_ENCRYPTION_KEY
APP_URL
R2_BUCKET_NAME
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM_EMAIL
CONTACT_FORM_TO_EMAIL
COGNITO_CLIENT_SECRET
COGNITO_ADMIN_GROUP_NAME
COGNITO_GROUPS_CLAIM_KEY
AWS_REGION
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
"

# Find all JavaScript files in the built application
STATIC_DIRS="/app/dist/static/chunks /app/dist/static/js /app/dist/static/css"

echo "🔧 Injecting runtime environment variables into client-side bundles..."

# Process NEXT_PUBLIC_ variables that are embedded in the client bundle
for var in $PUBLIC_ENV_VARS; do
  value=$(printenv "$var" || echo "")

  if [ -z "$value" ]; then
    echo "⚠️  Warning: $var is not set, keeping placeholder"
    continue
  fi

  echo "📝 Replacing $var in static files..."

  # Find and replace in all JS and CSS files
  for dir in $STATIC_DIRS; do
    if [ -d "$dir" ]; then
      # Escape special characters for sed
      escaped_value=$(echo "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')

      # Replace placeholder with actual value in all relevant files
      find "$dir" -type f \( -name "*.js" -o -name "*.css" \) -exec \
        sed -i "s|__${var}__|${escaped_value}|g" {} + 2>/dev/null || true
    fi
  done
done

# Process server-side variables that might have placeholders in config files
echo "🔧 Processing server-side environment variables..."

for var in $SERVER_ENV_VARS; do
  value=$(printenv "$var" || echo "")

  if [ -z "$value" ]; then
    echo "⚠️  Warning: $var is not set"
    continue
  fi

  # Check if the value is a placeholder and warn about it
  if echo "$value" | grep -q "^__.*__$"; then
    echo "⚠️  Warning: $var still has placeholder value: $value"
  else
    echo "✓ $var is properly configured"
  fi
done

# Validate critical environment variables
echo "🔍 Validating critical environment variables..."

critical_vars="APP_URL NEXT_PUBLIC_COGNITO_CLIENT_ID NEXT_PUBLIC_COGNITO_WELLKNOWN"
missing_vars=""

for var in $critical_vars; do
  value=$(printenv "$var" || echo "")
  if [ -z "$value" ]; then
    missing_vars="$missing_vars $var"
  fi
done

if [ -n "$missing_vars" ]; then
  echo "❌ Error: Missing critical environment variables:$missing_vars"
  echo "Please set these environment variables and restart the container."
  exit 1
fi

# Display configuration summary (without sensitive values)
echo "📊 Configuration Summary:"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo "   APP_URL: ${APP_URL:-not set}"
echo "   AWS_REGION: ${AWS_REGION:-not set}"
echo "   NEXT_PUBLIC_COGNITO_CLIENT_ID: $(echo ${NEXT_PUBLIC_COGNITO_CLIENT_ID} | cut -c1-8)..."
echo "   R2_BUCKET_NAME: ${R2_BUCKET_NAME:-not set}"

# Check if all required files exist
if [ ! -d "/app/dist" ]; then
  echo "❌ Error: Built application not found at /app/dist"
  exit 1
fi

if [ ! -f "/app/package.json" ]; then
  echo "❌ Error: package.json not found"
  exit 1
fi

echo "✅ Environment variable injection completed successfully!"
echo "🎯 Starting Next.js application..."

# Execute the main command
exec "$@"
