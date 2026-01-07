import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    res.on('finish', () => {
      const duration = Date.now() - start; // in milliseconds
      const prCount = req.body?.pullRequests?.length ?? 0;
      console.log({requestId,durationMs: duration,prCount,});
    });

    next();
  }
}
