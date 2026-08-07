import ***REMOVED***
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
***REMOVED*** from '@nestjs/common';

interface NormalizedError ***REMOVED***
  statusCode: number;
  message: string;
  errors?: string[];
***REMOVED***

interface HttpResponseLike ***REMOVED***
  status: (statusCode: number) => ***REMOVED*** json: (body: unknown) => void ***REMOVED***;
***REMOVED***

@Catch()
export class HttpExceptionFilter implements ExceptionFilter ***REMOVED***
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void ***REMOVED***
    const ctx = host.switchToHttp();
    const response: unknown = ctx.getResponse();

    const normalized = this.normalize(exception);

    const body: Record<string, unknown> = ***REMOVED***
      statusCode: normalized.statusCode,
      message: normalized.message,
***REMOVED***;
    if (normalized.errors && normalized.errors.length > 0) ***REMOVED***
      body.errors = normalized.errors;
***REMOVED***

    if (this.isHttpResponseLike(response)) ***REMOVED***
      response.status(normalized.statusCode).json(body);
***REMOVED*** else ***REMOVED***
      this.logger.error(
        'No HTTP response object available to send the error response',
      );
***REMOVED***
  ***REMOVED***

  private normalize(exception: unknown): NormalizedError ***REMOVED***
    if (exception instanceof HttpException) ***REMOVED***
      const status = exception.getStatus();
      return ***REMOVED*** statusCode: status, ...this.extract(exception.getResponse()) ***REMOVED***;
***REMOVED***

    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error('Unhandled exception', stack);
    return ***REMOVED***
      statusCode: 500,
      message: 'Internal server error',
***REMOVED***;
  ***REMOVED***

  private extract(response: unknown): ***REMOVED*** message: string; errors?: string[] ***REMOVED*** ***REMOVED***
    if (typeof response === 'string') ***REMOVED***
      return ***REMOVED*** message: response ***REMOVED***;
***REMOVED***
    if (typeof response === 'object' && response !== null) ***REMOVED***
      const res = response as Record<string, unknown>;
      const msg = res.message;
      if (Array.isArray(msg)) ***REMOVED***
        return ***REMOVED*** message: 'Bad request', errors: msg as string[] ***REMOVED***;
  ***REMOVED***
      if (typeof msg === 'string') ***REMOVED***
        return ***REMOVED*** message: msg ***REMOVED***;
  ***REMOVED***
      const error = res.error;
      if (typeof error === 'string') ***REMOVED***
        return ***REMOVED*** message: error ***REMOVED***;
  ***REMOVED***
***REMOVED***
    return ***REMOVED*** message: 'Internal server error' ***REMOVED***;
  ***REMOVED***

  private isHttpResponseLike(value: unknown): value is HttpResponseLike ***REMOVED***
    return (
      typeof value === 'object' &&
      value !== null &&
      'status' in value &&
      typeof (value as HttpResponseLike).status === 'function'
    );
  ***REMOVED***
***REMOVED***
