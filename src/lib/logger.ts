import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

interface LoggerOptions {
  level?: LogLevel;
}

export class Logger {
  private name: string;
  private level: LogLevel;
  private isServer: boolean;
  private isProduction: boolean;

  constructor(name: string, options: LoggerOptions = {}) {
    this.name = name;
    this.isServer = typeof window === 'undefined';
    this.isProduction = process.env.NODE_ENV === 'production';

    // Set log level from environment or default
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    this.level = options.level ?? this.parseLogLevel(envLevel) ?? LogLevel.INFO;

    // In production frontend, set to SILENT unless explicitly overridden
    if (!this.isServer && this.isProduction && !options.level && !envLevel) {
      this.level = LogLevel.SILENT;
    }
  }

  private parseLogLevel(level?: string): LogLevel | undefined {
    if (!level) return undefined;

    switch (level) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'SILENT':
        return LogLevel.SILENT;
      default:
        return undefined;
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  // This is now only used for client-side logging
  private formatMessage(level: string, message: string): string {
    const timestamp = this.formatTimestamp();
    const env = 'CLIENT';
    return `[${timestamp}] [${env}] [${this.name}] [${level}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private logToConsole(
    level: string,
    logLevel: LogLevel,
    message: string,
    ...args: any[]
  ): void {
    if (!this.shouldLog(logLevel)) return;

    // Determine the correct console method
    const logMethod =
      {
        DEBUG: console.log,
        INFO: console.log,
        WARN: console.warn,
        ERROR: console.error,
      }[level] || console.log;

    if (this.isServer) {
      // Backend logging with individual colors for better readability
      const timestamp = chalk.dim(`[${this.formatTimestamp()}]`);
      const env = chalk.magenta('[SERVER]');
      const name = chalk.cyan(`[${this.name}]`);

      let levelStr: string;
      let messageColorizer: (s: string) => string = (s) => s;

      switch (logLevel) {
        case LogLevel.DEBUG:
          levelStr = chalk.gray('[DEBUG]');
          messageColorizer = chalk.gray;
          break;
        case LogLevel.INFO:
          levelStr = chalk.blueBright('[INFO]');
          break;
        case LogLevel.WARN:
          levelStr = chalk.yellowBright('[WARN]');
          messageColorizer = chalk.yellow;
          break;
        case LogLevel.ERROR:
          levelStr = chalk.redBright('[ERROR]');
          messageColorizer = chalk.red;
          break;
        default:
          levelStr = `[${level}]`;
          break;
      }

      // The first argument to console.log can be a format string, but passing
      // multiple colored arguments allows for better inspection of objects in some terminals.
      // Safely stringify any non-string arguments to avoid logging errors
      const safeArgs = args.map((arg) => {
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      });
      logMethod(
        timestamp,
        env,
        name,
        levelStr,
        messageColorizer(message),
        ...safeArgs
      );
    } else {
      // Frontend logging without colors
      const formattedMessage = this.formatMessage(level, message);
      logMethod(formattedMessage, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    this.logToConsole('DEBUG', LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logToConsole('INFO', LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logToConsole('WARN', LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logToConsole('ERROR', LogLevel.ERROR, message, ...args);
  }

  // Convenience method for general logging (maps to info)
  log(message: string, ...args: any[]): void {
    this.info(message, ...args);
  }

  // Create a child logger with a different name
  child(childName: string): Logger {
    return new Logger(`${this.name}:${childName}`, {
      level: this.level,
    });
  }

  // Set log level dynamically
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  // Get current log level
  getLevel(): LogLevel {
    return this.level;
  }

  // Check if a level would be logged
  isLevelEnabled(level: LogLevel): boolean {
    return this.shouldLog(level);
  }
}

// Create default logger instance
export const logger = new Logger('APP');

// Factory function to create named loggers
export function createLogger(name: string, level?: LogLevel): Logger {
  return new Logger(name, { level });
}

// Export LogLevel for convenience
export { LogLevel as Level };

// Common logger instances for different parts of the application
export const authLogger = new Logger('AUTH');
export const apiLogger = new Logger('API');
export const dbLogger = new Logger('DB');
export const cacheLogger = new Logger('CACHE');
export const sessionLogger = new Logger('SESSION');
export const mfaLogger = new Logger('MFA');
export const passkeyLogger = new Logger('PASSKEY');
export const profileLogger = new Logger('PROFILE');
export const notificationLogger = new Logger('NOTIFICATION');
export const middlewareLogger = new Logger('MIDDLEWARE');
