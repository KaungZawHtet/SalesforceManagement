import ***REMOVED*** Logger, ValidationPipe ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** ConfigService ***REMOVED*** from '@nestjs/config';
import ***REMOVED*** NestFactory ***REMOVED*** from '@nestjs/core';
import ***REMOVED*** AppModule ***REMOVED*** from './app.module';
import ***REMOVED*** HttpExceptionFilter ***REMOVED*** from './common/filters/http-exception.filter';

async function bootstrap() ***REMOVED***
  const app = await NestFactory.create(AppModule, ***REMOVED***
    bufferLogs: true,
  ***REMOVED***);
  const configService = app.get(ConfigService);

  const corsOrigin = configService.get<string>('corsOrigin');
  app.enableCors(***REMOVED***
    origin: corsOrigin,
    credentials: true,
  ***REMOVED***);

  app.useGlobalPipes(
    new ValidationPipe(***REMOVED***
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: ***REMOVED***
        enableImplicitConversion: false,
  ***REMOVED***
***REMOVED***),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  Logger.log(`Salesforce Account Manager backend listening on port $***REMOVED***port***REMOVED***`);
***REMOVED***

void bootstrap();
