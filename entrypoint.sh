#!/bin/sh

# entrypoint.sh - Runtime environment variable injection for Next.js static files

set -e

# List of environment variables to inject (add/remove as needed)
ENV_VARS="
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_WELLKNOWN
APP_URL
R2_BUCKET_NAME
NEXT_PUBLIC_R2_PUBLIC_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM_EMAIL
CONTACT_FORM_TO_EMAIL
"

# Directory containing built static JS files (adjust if needed)
STATIC_DIR="/app/.next/static/chunks"
if [ ! -d "$STATIC_DIR" ]; then
  STATIC_DIR="/app/.next/static/js"
fi

echo "Injecting runtime environment variables into static files..."

for var in $ENV_VARS; do
  value=$(printenv $var)
  if [ -z "$value" ]; then
    echo "Warning: Environment variable $var is not set."
    value="__${var}__"
  fi

  # Replace all occurrences of __VAR__ with the actual value in all JS files
  find "$STATIC_DIR" -type f -name "*.js" -exec sed -i "s|__${var}__|${value}|g" {} +
done

echo "Environment variable injection complete."

# Start the original command (e.g., npm start)
exec "$@"
