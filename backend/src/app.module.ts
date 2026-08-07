import ***REMOVED*** Module ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** ConfigModule ***REMOVED*** from '@nestjs/config';
import configuration, ***REMOVED*** validateEnv ***REMOVED*** from './config/configuration';
import ***REMOVED*** AccountsModule ***REMOVED*** from './accounts/accounts.module';
import ***REMOVED*** AuthModule ***REMOVED*** from './auth/auth.module';
import ***REMOVED*** HealthController ***REMOVED*** from './common/health/health.controller';
import ***REMOVED*** SalesforceModule ***REMOVED*** from './salesforce/salesforce.module';

@Module(***REMOVED***
  imports: [
    ConfigModule.forRoot(***REMOVED***
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
***REMOVED***),
    SalesforceModule,
    AccountsModule,
    AuthModule,
***REMOVED***,
  controllers: [HealthController],
***REMOVED***)
export class AppModule ***REMOVED******REMOVED***
