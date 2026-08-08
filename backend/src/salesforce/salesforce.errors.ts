import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  SalesforceError,
  SalesforceTokenResponse,
} from './types/salesforce.interfaces';

interface HttpErrorPayload {
  statusCode: number;
  message: string;
}

export function parseSalesforceErrors(body: unknown): SalesforceError[] {
  if (Array.isArray(body)) {
    return body as SalesforceError[];
  }
  return [];
}

export function buildHttpException(
  status: number,
  body: unknown,
): HttpErrorPayload {
  const errors = parseSalesforceErrors(body);
  const errorCode = errors[0]?.errorCode;
  const firstMessage = errors[0]?.message;

  if (status === 504) {
    return {
      statusCode: 504,
      message: 'Salesforce request timed out. Please try again.',
    };
  }

  switch (errorCode) {
    case 'INVALID_SESSION_ID':
    case 'INVALID_LOGIN':
      return {
        statusCode: 401,
        message: 'Salesforce authentication failed. Please verify credentials.',
      };
    case 'REQUEST_LIMIT_EXCEEDED':
    case 'REQUEST_LIMIT_REACHED':
      return {
        statusCode: 503,
        message: 'Salesforce API limit exceeded. Please try again later.',
      };
    case 'INSUFFICIENT_ACCESS':
    case 'INSUFFICIENT_ACCESS_OR_READONLY':
    case 'API_DISABLED':
      return {
        statusCode: 403,
        message: 'Access to this Salesforce resource is not permitted.',
      };
    case 'REQUIRED_FIELD_MISSING':
    case 'FIELD_INTEGRITY_EXCEPTION':
    case 'FIELD_CUSTOM_VALIDATION_EXCEPTION':
      return {
        statusCode: 400,
        message: firstMessage ?? 'Invalid data provided to Salesforce.',
      };
    default:
      if (status === 400) {
        return {
          statusCode: 400,
          message: firstMessage ?? 'Invalid request sent to Salesforce.',
        };
      }
      if (status === 401) {
        return {
          statusCode: 401,
          message:
            'Salesforce authentication failed. Please verify credentials.',
        };
      }
      if (status === 403) {
        return {
          statusCode: 403,
          message: 'Access to this Salesforce resource is not permitted.',
        };
      }
      if (status === 429) {
        return {
          statusCode: 503,
          message:
            'Salesforce is temporarily unavailable. Please try again later.',
        };
      }
      if (status >= 500) {
        return {
          statusCode: 503,
          message: 'Salesforce service is unavailable. Please try again later.',
        };
      }
      return {
        statusCode: 502,
        message: 'Salesforce is unavailable. Please try again later.',
      };
  }
}

export function translateSalesforceError(
  status: number,
  body: unknown,
): HttpException {
  const { statusCode, message } = buildHttpException(status, body);
  if (statusCode === 504) {
    return new HttpException(message, 504);
  }
  switch (statusCode) {
    case 400:
      return new BadRequestException(message);
    case 401:
      return new UnauthorizedException(message);
    case 403:
      return new ForbiddenException(message);
    case 503:
      return new ServiceUnavailableException(message);
    default:
      return new BadGatewayException(message);
  }
}

export function translateAuthError(
  response: Response,
  body: SalesforceTokenResponse,
): HttpException {
  const logger = new Logger('SalesforceAuth');
  const isInvalidGrant =
    typeof body === 'object' &&
    (body.error === 'invalid_grant' || body.error === 'invalid_client');
  logger.error(`Salesforce authentication failed (status ${response.status}).`);
  if (isInvalidGrant) {
    return new UnauthorizedException(
      'Salesforce authentication failed. Please verify credentials.',
    );
  }
  return new BadGatewayException(
    'Salesforce authentication failed. Please verify your credentials and Connected App configuration.',
  );
}
