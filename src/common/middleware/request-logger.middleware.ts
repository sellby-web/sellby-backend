import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { AppLogger } from '../logger/app-logger';

declare global {
  namespace Express {
    interface Request {
      meta: { requestId: string };
    }
  }
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    req.meta = { requestId: randomUUID() };
    this.logger.info('HTTP', `${req.method} ${req.url}`, req.meta.requestId, { ip: req.ip });
    next();
  }
}
