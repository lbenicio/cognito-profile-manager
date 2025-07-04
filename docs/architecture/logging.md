# Logging System Documentation

This project uses a custom logging system built with TypeScript that provides structured, colorized logging with environment-aware behavior.

## Features

- **Colored terminal output** (server-side only)
- **Timestamp and environment tracking**
- **Component-specific loggers**
- **Environment-aware log levels**
- **Production-safe frontend logging**
- **Configurable log levels via environment variables**

## Quick Start

### Basic Usage

```typescript
import { Logger } from '@/lib/logger';

const logger = new Logger('COMPONENT-NAME');

logger.info('This is an info message');
logger.warn('This is a warning');
logger.error('This is an error', errorObject);
logger.debug('This is debug info');
```

### Using Pre-configured Loggers

```typescript
import { authLogger, apiLogger, dbLogger } from '@/lib/logger';

authLogger.info('User authenticated successfully');
apiLogger.error('API request failed', error);
dbLogger.debug('Database query executed');
```

## Logger Configuration

### Environment Variables

Set the `LOG_LEVEL` environment variable to control logging output:

```bash
# Development
LOG_LEVEL=DEBUG

# Production
LOG_LEVEL=ERROR

# Available levels: DEBUG, INFO, WARN, ERROR, SILENT
```

### Log Levels

| Level  | Value | Description                    |
| ------ | ----- | ------------------------------ |
| DEBUG  | 0     | Detailed debugging information |
| INFO   | 1     | General informational messages |
| WARN   | 2     | Warning messages               |
| ERROR  | 3     | Error messages only            |
| SILENT | 4     | No logging output              |

## Environment Behavior

### Server-Side (Node.js)

- Full colored output with timestamps
- All log levels available
- Default level: `INFO` (configurable via `LOG_LEVEL`)

### Client-Side (Browser)

- Plain text output (no colors)
- Production builds automatically set to `SILENT` unless overridden
- Development builds follow `LOG_LEVEL` setting

## Creating Component-Specific Loggers

Each component should create its own logger instance:

```typescript
// In your component/module file
import { Logger } from '@/lib/logger';

const logger = new Logger('YOUR-COMPONENT-NAME');

export function myFunction() {
  logger.info('Function executed');
}
```

### Naming Conventions

Use descriptive, uppercase names with hyphens:

- `AUTH` - Authentication related
- `API` - API routes and calls
- `DB` - Database operations
- `CACHE` - Caching operations
- `USER-PROFILE` - User profile management
- `PAYMENT-PROCESSING` - Payment related operations

## Pre-configured Loggers

The following loggers are available for import:

```typescript
import {
  authLogger, // Authentication
  apiLogger, // API operations
  dbLogger, // Database operations
  cacheLogger, // Cache operations
  sessionLogger, // Session management
  mfaLogger, // Multi-factor authentication
  passkeyLogger, // Passkey/WebAuthn
  profileLogger, // User profile operations
  notificationLogger, // Notifications
  middlewareLogger, // Middleware operations
} from '@/lib/logger';
```

## Advanced Usage

### Child Loggers

Create specialized loggers for sub-components:

```typescript
const logger = new Logger('PAYMENT');
const stripeLogger = logger.child('STRIPE');
const paypalLogger = logger.child('PAYPAL');

stripeLogger.info('Processing Stripe payment');
// Output: [timestamp] [SERVER] [PAYMENT:STRIPE] [INFO] Processing Stripe payment
```

### Dynamic Log Level Changes

```typescript
const logger = new Logger('API');

// Check current level
if (logger.isLevelEnabled(LogLevel.DEBUG)) {
  logger.debug('Detailed API request info');
}

// Change level at runtime
logger.setLevel(LogLevel.ERROR);
```

### Conditional Logging

```typescript
import { Logger, LogLevel } from '@/lib/logger';

const logger = new Logger('PERFORMANCE');

// Only log expensive operations in debug mode
if (logger.isLevelEnabled(LogLevel.DEBUG)) {
  const startTime = Date.now();
  // ... expensive operation
  logger.debug(`Operation completed in ${Date.now() - startTime}ms`);
}
```

## Output Format

### Server-Side Output

```
[2024-01-15T10:30:45.123Z] [SERVER] [AUTH] [INFO] User login successful
[2024-01-15T10:30:46.456Z] [SERVER] [API] [ERROR] Database connection failed
```

### Client-Side Output

```
[2024-01-15T10:30:45.123Z] [CLIENT] [USER-PROFILE] [WARN] Profile data incomplete
```

## Best Practices

### 1. Use Appropriate Log Levels

- **DEBUG**: Detailed flow information, variable values
- **INFO**: General application flow, successful operations
- **WARN**: Recoverable errors, deprecated usage
- **ERROR**: Serious problems, exceptions

### 2. Include Context

```typescript
// Good
logger.error('Failed to save user profile', {
  userId: user.id,
  error: error.message,
});

// Avoid
logger.error('Save failed');
```

### 3. Don't Log Sensitive Information

```typescript
// Never do this
logger.info('User password', { password: user.password });

// Do this instead
logger.info('Password validation completed', { userId: user.id });
```

### 4. Use Structured Logging

```typescript
logger.info('API request completed', {
  endpoint: '/api/users',
  method: 'POST',
  status: 201,
  duration: 125,
  userId: user.id,
});
```

## Migration from console.log

Replace console statements with appropriate logger calls:

```typescript
// Before
console.log('User authenticated');
console.error('Authentication failed', error);
console.warn('Deprecated API usage');

// After
logger.info('User authenticated');
logger.error('Authentication failed', error);
logger.warn('Deprecated API usage');
```

## Troubleshooting

### No Log Output

1. Check `LOG_LEVEL` environment variable
2. Verify logger level allows the message type
3. In production frontend, logs are silent by default

### Missing Colors

- Colors only work server-side
- Client-side logging is always plain text

### Performance Concerns

- Logging is designed to be lightweight
- Use conditional logging for expensive debug operations
- Consider log level in production environments

## Examples

### API Route Logging

```typescript
// src/app/api/users/route.ts
import { Logger } from '@/lib/logger';

const logger = new Logger('API-USERS');

export async function POST(request: Request) {
  try {
    logger.info('Creating new user');
    const user = await createUser(userData);
    logger.info('User created successfully', { userId: user.id });
    return Response.json(user);
  } catch (error) {
    logger.error('User creation failed', error);
    return Response.json({ error: 'Creation failed' }, { status: 500 });
  }
}
```

### Component Logging

```typescript
// src/components/user-profile.tsx
'use client';

import { Logger } from '@/lib/logger';

const logger = new Logger('USER-PROFILE-COMPONENT');

export function UserProfile() {
  useEffect(() => {
    logger.debug('UserProfile component mounted');

    return () => {
      logger.debug('UserProfile component unmounted');
    };
  }, []);

  const handleSave = async () => {
    try {
      logger.info('Saving user profile');
      await saveProfile();
      logger.info('Profile saved successfully');
    } catch (error) {
      logger.error('Failed to save profile', error);
    }
  };

  return <div>...</div>;
}
```
