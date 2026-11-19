# Logging

The application uses `Logger` from `src/lib/logger.ts`. Create a named logger in a server or client module and call `debug`, `info`, `warn`, or `error` with a message and optional context values.

```ts
import { Logger } from '@/lib/logger';

const logger = new Logger('PROFILE');
logger.info('Profile updated', { userId });
logger.error('Profile update failed', error);
```

Set `LOG_LEVEL` to `DEBUG`, `INFO`, `WARN`, `ERROR`, or `SILENT`. The default is `INFO`; browser logging is silent in production unless a level is explicitly configured. Do not log passwords, tokens, session cookies, or other secrets.

The logger serializes non-string server arguments for terminal output. Avoid placing personal data or credentials in log context because deployment logs may be retained outside the application.
