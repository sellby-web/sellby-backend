import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { AppLogger, RequestMeta } from '../logger/app-logger';

declare global {
  namespace Express {
    interface Request {
      meta: RequestMeta;
    }
  }
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    req.meta = { requestId: randomUUID(), ordinal: 0 };

    this.logger.info('HTTP', `${req.method} ${req.url}`, req.meta, {
      ip: req.ip,
    });

    // release meta reference on finish so it doesn't outlive
    //  the request on keep-alive connections

    res.on('finish', () => {
      (req as any).meta = undefined;
    });

    next();
  }
}
