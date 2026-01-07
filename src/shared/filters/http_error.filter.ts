import {ExceptionFilter,Catch, ArgumentsHost,HttpException,HttpStatus,} from '@nestjs/common';
import { Response } from 'express';
@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const resBody = exception.getResponse();

    response.status(status).json({
      error: {
        code: HttpStatus[status],
        message: typeof resBody === 'string'
          ? resBody
          : (resBody as any).message || 'Bad Request',
      },
    });
  }
}
