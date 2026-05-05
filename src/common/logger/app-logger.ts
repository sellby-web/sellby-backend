import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

let ordinal = 0;

function sanitize(data: unknown): unknown {
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    copy[k] = k === 'password' ? '[REDACTED]' : sanitize(v);
  }
  return copy;
}

@Injectable()
export class AppLogger {
  private readonly winston: winston.Logger;

  constructor() {
    this.winston = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/app.log',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          tailable: true,
        }),
      ],
    });
  }

  private meta(context: string, requestId?: string, data?: unknown) {
    return {
      ordinal: ++ordinal,
      requestId: requestId ?? 'no-request',
      context,
      ...(data !== undefined && { data: sanitize(data) }),
    };
  }

  info(context: string, message: string, requestId?: string, data?: unknown): void {
    this.winston.info(message, this.meta(context, requestId, data));
  }

  warn(context: string, message: string, requestId?: string, data?: unknown): void {
    this.winston.warn(message, this.meta(context, requestId, data));
  }

  error(context: string, message: string, requestId?: string, data?: unknown): void {
    this.winston.error(message, this.meta(context, requestId, data));
  }
}
