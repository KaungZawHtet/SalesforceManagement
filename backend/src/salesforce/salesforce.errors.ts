import ***REMOVED***
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
***REMOVED*** from '@nestjs/common';
import ***REMOVED***
  SalesforceError,
  SalesforceTokenResponse,
***REMOVED*** from './types/salesforce.interfaces';

interface HttpErrorPayload ***REMOVED***
  statusCode: number;
  message: string;
***REMOVED***

export function parseSalesforceErrors(body: unknown): SalesforceError[] ***REMOVED***
  if (Array.isArray(body)) ***REMOVED***
    return body as SalesforceError[];
  ***REMOVED***
  return [];
***REMOVED***

export function buildHttpException(
  status: number,
  body: unknown,
): HttpErrorPayload ***REMOVED***
  const errors = parseSalesforceErrors(body);
  const errorCode = errors[0]?.errorCode;
  const firstMessage = errors[0]?.message;

  if (status === 504) ***REMOVED***
    return ***REMOVED***
      statusCode: 504,
      message: 'Salesforce request timed out. Please try again.',
***REMOVED***;
  ***REMOVED***

  switch (errorCode) ***REMOVED***
    case 'INVALID_SESSION_ID':
    case 'INVALID_LOGIN':
      return ***REMOVED***
        statusCode: 401,
        message: 'Salesforce authentication failed. Please verify credentials.',
  ***REMOVED***;
    case 'REQUEST_LIMIT_EXCEEDED':
    case 'REQUEST_LIMIT_REACHED':
      return ***REMOVED***
        statusCode: 503,
        message: 'Salesforce API limit exceeded. Please try again later.',
  ***REMOVED***;
    case 'INSUFFICIENT_ACCESS':
    case 'INSUFFICIENT_ACCESS_OR_READONLY':
    case 'API_DISABLED':
      return ***REMOVED***
        statusCode: 403,
        message: 'Access to this Salesforce resource is not permitted.',
  ***REMOVED***;
    case 'REQUIRED_FIELD_MISSING':
    case 'FIELD_INTEGRITY_EXCEPTION':
    case 'FIELD_CUSTOM_VALIDATION_EXCEPTION':
      return ***REMOVED***
        statusCode: 400,
        message: firstMessage ?? 'Invalid data provided to Salesforce.',
  ***REMOVED***;
    default:
      if (status === 400) ***REMOVED***
        return ***REMOVED***
          statusCode: 400,
          message: firstMessage ?? 'Invalid request sent to Salesforce.',
    ***REMOVED***;
  ***REMOVED***
      if (status === 401) ***REMOVED***
        return ***REMOVED***
          statusCode: 401,
          message:
            'Salesforce authentication failed. Please verify credentials.',
    ***REMOVED***;
  ***REMOVED***
      if (status === 403) ***REMOVED***
        return ***REMOVED***
          statusCode: 403,
          message: 'Access to this Salesforce resource is not permitted.',
    ***REMOVED***;
  ***REMOVED***
      if (status === 429) ***REMOVED***
        return ***REMOVED***
          statusCode: 503,
          message:
            'Salesforce is temporarily unavailable. Please try again later.',
    ***REMOVED***;
  ***REMOVED***
      if (status >= 500) ***REMOVED***
        return ***REMOVED***
          statusCode: 503,
          message: 'Salesforce service is unavailable. Please try again later.',
    ***REMOVED***;
  ***REMOVED***
      return ***REMOVED***
        statusCode: 502,
        message: 'Salesforce is unavailable. Please try again later.',
  ***REMOVED***;
  ***REMOVED***
***REMOVED***

export function translateSalesforceError(
  status: number,
  body: unknown,
): HttpException ***REMOVED***
  const ***REMOVED*** statusCode, message ***REMOVED*** = buildHttpException(status, body);
  if (statusCode === 504) ***REMOVED***
    return new HttpException(message, 504);
  ***REMOVED***
  switch (statusCode) ***REMOVED***
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
  ***REMOVED***
***REMOVED***

export function translateAuthError(
  response: Response,
  body: SalesforceTokenResponse,
): HttpException ***REMOVED***
  const logger = new Logger('SalesforceAuth');
  const isInvalidGrant =
    typeof body === 'object' &&
    (body.error === 'invalid_grant' || body.error === 'invalid_client');
  logger.error(`Salesforce authentication failed (status $***REMOVED***response.status***REMOVED***).`);
  if (isInvalidGrant) ***REMOVED***
    return new UnauthorizedException(
      'Salesforce authentication failed. Please verify credentials.',
    );
  ***REMOVED***
  return new BadGatewayException(
    'Salesforce authentication failed. Please verify your credentials and Connected App configuration.',
  );
***REMOVED***
