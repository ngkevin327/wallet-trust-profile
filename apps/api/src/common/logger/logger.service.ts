import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

@Injectable()
export class JsonLoggerService implements NestLoggerService {
  private write(level: LogLevel, message: string, context?: string, meta?: LogPayload) {
    const entry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    const line = JSON.stringify(entry);
    if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  logRequest(requestId: string, method: string, path: string, statusCode: number, durationMs: number) {
    this.write("info", "request completed", "HTTP", {
      requestId,
      method,
      path,
      statusCode,
      durationMs,
    });
  }

  log(message: string, context?: string) {
    this.write("info", message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.write("error", message, context, trace ? { trace } : undefined);
  }

  warn(message: string, context?: string) {
    this.write("warn", message, context);
  }

  debug(message: string, context?: string) {
    this.write("debug", message, context);
  }

  verbose(message: string, context?: string) {
    this.write("debug", message, context);
  }
}
