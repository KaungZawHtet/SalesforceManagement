import ***REMOVED*** Controller, Get, HttpCode ***REMOVED*** from '@nestjs/common';

@Controller('api/health')
export class HealthController ***REMOVED***
  @Get()
  @HttpCode(200)
  check(): ***REMOVED*** status: string ***REMOVED*** ***REMOVED***
    return ***REMOVED*** status: 'ok' ***REMOVED***;
  ***REMOVED***
***REMOVED***
