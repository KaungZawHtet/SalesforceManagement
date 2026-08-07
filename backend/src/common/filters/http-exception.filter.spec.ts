import ***REMOVED*** BadRequestException, UnauthorizedException ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** ArgumentsHost ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** HttpExceptionFilter ***REMOVED*** from './http-exception.filter';

describe('HttpExceptionFilter', () => ***REMOVED***
  let filter: HttpExceptionFilter;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => ***REMOVED***
    filter = new HttpExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue(***REMOVED*** json: jsonMock ***REMOVED***);
    const response = ***REMOVED*** status: statusMock ***REMOVED***;
    host = ***REMOVED***
      switchToHttp: () => (***REMOVED***
        getResponse: () => response,
  ***REMOVED***),
***REMOVED*** as unknown as ArgumentsHost;
  ***REMOVED***);

  it('formats validation errors with an errors array', () => ***REMOVED***
    const exception = new BadRequestException([
      'name must be a string',
      'name should not be empty',
  ***REMOVED***);

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(***REMOVED***
      statusCode: 400,
      message: 'Bad request',
      errors: ['name must be a string', 'name should not be empty'],
***REMOVED***);
  ***REMOVED***);

  it('maps a simple HttpException message', () => ***REMOVED***
    const exception = new UnauthorizedException('Token expired');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(***REMOVED***
      statusCode: 401,
      message: 'Token expired',
***REMOVED***);
  ***REMOVED***);

  it('returns a 500 for unhandled exceptions', () => ***REMOVED***
    filter.catch(new Error('unexpected'), host);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(***REMOVED***
      statusCode: 500,
      message: 'Internal server error',
***REMOVED***);
  ***REMOVED***);
***REMOVED***);
