import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  buildHttpException,
  parseSalesforceErrors,
  translateSalesforceError,
} from './salesforce.errors';

describe('salesforce.errors', () => {
  describe('parseSalesforceErrors', () => {
    it('returns the array of errors when body is an array', () => {
      const body = [
        { errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION', message: 'bad' },
      ];
      expect(parseSalesforceErrors(body)).toBe(body);
    });

    it('returns an empty array for non-array bodies', () => {
      expect(parseSalesforceErrors({ foo: 1 })).toEqual([]);
      expect(parseSalesforceErrors(null)).toEqual([]);
      expect(parseSalesforceErrors('text')).toEqual([]);
    });
  });

  describe('translateSalesforceError', () => {
    it('maps INVALID_LOGIN to UnauthorizedException (401)', () => {
      const exception = translateSalesforceError(400, [
        { errorCode: 'INVALID_LOGIN', message: 'bad creds' },
      ]);
      expect(exception).toBeInstanceOf(UnauthorizedException);
      expect(exception.getStatus()).toBe(401);
      expect(exception.message).toBe(
        'Salesforce authentication failed. Please verify credentials.',
      );
    });

    it('maps INVALID_SESSION_ID to UnauthorizedException (401)', () => {
      const exception = translateSalesforceError(401, [
        { errorCode: 'INVALID_SESSION_ID', message: 'session expired' },
      ]);
      expect(exception).toBeInstanceOf(UnauthorizedException);
      expect(exception.getStatus()).toBe(401);
    });

    it('maps REQUEST_LIMIT_EXCEEDED to ServiceUnavailableException (503)', () => {
      const exception = translateSalesforceError(400, [
        { errorCode: 'REQUEST_LIMIT_EXCEEDED', message: 'limit' },
      ]);
      expect(exception).toBeInstanceOf(ServiceUnavailableException);
      expect(exception.getStatus()).toBe(503);
    });

    it('maps INSUFFICIENT_ACCESS to ForbiddenException (403)', () => {
      const exception = translateSalesforceError(403, [
        { errorCode: 'INSUFFICIENT_ACCESS', message: 'denied' },
      ]);
      expect(exception).toBeInstanceOf(ForbiddenException);
      expect(exception.getStatus()).toBe(403);
    });

    it('maps record-level validation errors to BadRequestException (400)', () => {
      const exception = translateSalesforceError(400, [
        {
          errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION',
          message: 'Validation failed',
        },
      ]);
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.message).toBe('Validation failed');
    });

    it('maps a generic 400 to BadRequestException', () => {
      const exception = translateSalesforceError(400, [
        { errorCode: 'UNKNOWN_ERROR', message: 'nope' },
      ]);
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception.getStatus()).toBe(400);
    });

    it('maps a 500 error to ServiceUnavailableException (503)', () => {
      const exception = translateSalesforceError(500, [{ message: 'boom' }]);
      expect(exception).toBeInstanceOf(ServiceUnavailableException);
      expect(exception.getStatus()).toBe(503);
    });

    it('maps an unexpected status to BadGatewayException (502)', () => {
      const exception = translateSalesforceError(418, []);
      expect(exception).toBeInstanceOf(BadGatewayException);
      expect(exception.getStatus()).toBe(502);
    });
  });

  describe('buildHttpException', () => {
    it('never leaks Salesforce error codes in the message', () => {
      const payload = buildHttpException(400, [
        {
          errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION',
          message: 'secret-internal',
        },
      ]);
      expect(payload.message).toBe('secret-internal');
      expect(payload.statusCode).toBe(400);
    });
  });
});
