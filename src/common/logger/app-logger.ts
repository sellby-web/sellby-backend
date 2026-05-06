import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

export interface RequestMeta {
  requestId: string;
  ordinal: number;
}

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
          // tailable keeps the active file always named app.log after rotation; without it Winston renames the file on each rotation and the active log gets a numeric suffix
          tailable: true,
        }),
      ],
    });
  }

  private buildMeta(context: string, meta?: RequestMeta, data?: unknown) {
    return {
      // mutates meta.ordinal in-place so every log line for the same request gets a monotonically increasing sequence number, enabling ordering in log aggregators
      ordinal: meta ? ++meta.ordinal : 0,
      // 'no-request' identifies log entries emitted outside the HTTP request lifecycle (e.g. app startup, background jobs)
      requestId: meta?.requestId ?? 'no-request',
      context,
      ...(data !== undefined && { data: sanitize(data) }),
    };
  }

  info(context: string, message: string, meta?: RequestMeta, data?: unknown): void {
    this.winston.info(message, this.buildMeta(context, meta, data));
  }

  warn(context: string, message: string, meta?: RequestMeta, data?: unknown): void {
    this.winston.warn(message, this.buildMeta(context, meta, data));
  }

  error(context: string, message: string, meta?: RequestMeta, data?: unknown): void {
    this.winston.error(message, this.buildMeta(context, meta, data));
  }
}
