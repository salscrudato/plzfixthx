import { isDevelopment } from "./env";

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogContext {
  [key: string]: any;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = isDevelopment() ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("INFO", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      };
      console.error(this.formatMessage("ERROR", message, errorContext));
    }
  }

  /** Log API call */
  apiCall(method: string, url: string, context?: LogContext): void {
    this.debug(`API ${method} ${url}`, context);
  }

  /** Log API response */
  apiResponse(method: string, url: string, status: number, duration: number): void {
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `API ${method} ${url} - ${status} (${duration}ms)`;
    
    if (level === LogLevel.ERROR) {
      this.error(message);
    } else if (level === LogLevel.WARN) {
      this.warn(message);
    } else {
      this.debug(message);
    }
  }

  /** Log user action */
  userAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, context);
  }

  /** Log performance metric */
  performance(metric: string, value: number, unit: string = "ms"): void {
    this.debug(`Performance: ${metric} = ${value}${unit}`);
  }
}

export const logger = new Logger();

