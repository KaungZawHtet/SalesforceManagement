import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

interface NormalizedError {
  statusCode: number;
  message: string;
  errors?: string[];
}

interface HttpResponseLike {
  status: (statusCode: number) => { json: (body: unknown) => void };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: unknown = ctx.getResponse();
    const normalized = this.normalize(exception);

    const body: Record<string, unknown> = {
      statusCode: normalized.statusCode,
      message: normalized.message,
    };
    if (normalized.errors && normalized.errors.length > 0) {
      body.errors = normalized.errors;
    }

    if (this.isHttpResponseLike(response)) {
      response.status(normalized.statusCode).json(body);
    } else {
      this.logger.error(
        'No HTTP response object available to send the error response',
      );
    }
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return { statusCode: status, ...this.extract(exception.getResponse()) };
    }

    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error('Unhandled exception', stack);
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }

  private extract(response: unknown): { message: string; errors?: string[] } {
    if (typeof response === 'string') {
      return { message: response };
    }
    if (typeof response === 'object' && response !== null) {
      const res = response as Record<string, unknown>;
      const msg = res.message;
      if (Array.isArray(msg)) {
        return { message: 'Bad request', errors: msg as string[] };
      }
      if (typeof msg === 'string') {
        return { message: msg };
      }
      const error = res.error;
      if (typeof error === 'string') {
        return { message: error };
      }
    }
    return { message: 'Internal server error' };
  }

  private isHttpResponseLike(value: unknown): value is HttpResponseLike {
    return (
      typeof value === 'object' &&
      value !== null &&
      'status' in value &&
      typeof (value as HttpResponseLike).status === 'function'
    );
  }
}
