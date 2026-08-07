import ***REMOVED***
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
***REMOVED*** from '@nestjs/common';
import ***REMOVED***
  buildHttpException,
  parseSalesforceErrors,
  translateSalesforceError,
***REMOVED*** from './salesforce.errors';

describe('salesforce.errors', () => ***REMOVED***
  describe('parseSalesforceErrors', () => ***REMOVED***
    it('returns the array of errors when body is an array', () => ***REMOVED***
      const body = [
        ***REMOVED*** errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION', message: 'bad' ***REMOVED***,
    ***REMOVED***;
      expect(parseSalesforceErrors(body)).toBe(body);
***REMOVED***);

    it('returns an empty array for non-array bodies', () => ***REMOVED***
      expect(parseSalesforceErrors(***REMOVED*** foo: 1 ***REMOVED***)).toEqual([]);
      expect(parseSalesforceErrors(null)).toEqual([]);
      expect(parseSalesforceErrors('text')).toEqual([]);
***REMOVED***);
  ***REMOVED***);

  describe('translateSalesforceError', () => ***REMOVED***
    it('maps INVALID_LOGIN to UnauthorizedException (401)', () => ***REMOVED***
      const ex = translateSalesforceError(400, [
        ***REMOVED*** errorCode: 'INVALID_LOGIN', message: 'bad creds' ***REMOVED***,
    ***REMOVED***);
      expect(ex).toBeInstanceOf(UnauthorizedException);
      expect(ex.getStatus()).toBe(401);
      expect(ex.message).toBe(
        'Salesforce authentication failed. Please verify credentials.',
      );
***REMOVED***);

    it('maps INVALID_SESSION_ID to UnauthorizedException (401)', () => ***REMOVED***
      const ex = translateSalesforceError(401, [
        ***REMOVED*** errorCode: 'INVALID_SESSION_ID', message: 'session expired' ***REMOVED***,
    ***REMOVED***);
      expect(ex).toBeInstanceOf(UnauthorizedException);
      expect(ex.getStatus()).toBe(401);
***REMOVED***);

    it('maps REQUEST_LIMIT_EXCEEDED to ServiceUnavailableException (503)', () => ***REMOVED***
      const ex = translateSalesforceError(400, [
        ***REMOVED*** errorCode: 'REQUEST_LIMIT_EXCEEDED', message: 'limit' ***REMOVED***,
    ***REMOVED***);
      expect(ex).toBeInstanceOf(ServiceUnavailableException);
      expect(ex.getStatus()).toBe(503);
***REMOVED***);

    it('maps INSUFFICIENT_ACCESS to ForbiddenException (403)', () => ***REMOVED***
      const ex = translateSalesforceError(403, [
        ***REMOVED*** errorCode: 'INSUFFICIENT_ACCESS', message: 'denied' ***REMOVED***,
    ***REMOVED***);
      expect(ex).toBeInstanceOf(ForbiddenException);
      expect(ex.getStatus()).toBe(403);
***REMOVED***);

    it('maps record-level validation errors to BadRequestException (400)', () => ***REMOVED***
      const ex = translateSalesforceError(400, [
        ***REMOVED***
          errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION',
          message: 'Validation failed',
    ***REMOVED***
    ***REMOVED***);
      expect(ex).toBeInstanceOf(BadRequestException);
      expect(ex.getStatus()).toBe(400);
      expect(ex.message).toBe('Validation failed');
***REMOVED***);

    it('maps a generic 400 to BadRequestException', () => ***REMOVED***
      const ex = translateSalesforceError(400, [
        ***REMOVED*** errorCode: 'UNKNOWN_ERROR', message: 'nope' ***REMOVED***,
    ***REMOVED***);
      expect(ex).toBeInstanceOf(BadRequestException);
      expect(ex.getStatus()).toBe(400);
***REMOVED***);

    it('maps a 500 error to ServiceUnavailableException (503)', () => ***REMOVED***
      const ex = translateSalesforceError(500, [***REMOVED*** message: 'boom' ***REMOVED***]);
      expect(ex).toBeInstanceOf(ServiceUnavailableException);
      expect(ex.getStatus()).toBe(503);
***REMOVED***);

    it('maps an unexpected status to BadGatewayException (502)', () => ***REMOVED***
      const ex = translateSalesforceError(418, []);
      expect(ex).toBeInstanceOf(BadGatewayException);
      expect(ex.getStatus()).toBe(502);
***REMOVED***);
  ***REMOVED***);

  describe('buildHttpException', () => ***REMOVED***
    it('never leaks Salesforce error codes in the message', () => ***REMOVED***
      const payload = buildHttpException(400, [
        ***REMOVED***
          errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION',
          message: 'secret-internal',
    ***REMOVED***
    ***REMOVED***);
      expect(payload.message).toBe('secret-internal');
      expect(payload.statusCode).toBe(400);
***REMOVED***);
  ***REMOVED***);
***REMOVED***);
