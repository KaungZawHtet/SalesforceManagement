import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateEnv } from './config/configuration';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './common/health/health.controller';
import { SalesforceModule } from './salesforce/salesforce.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    SalesforceModule,
    AccountsModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
