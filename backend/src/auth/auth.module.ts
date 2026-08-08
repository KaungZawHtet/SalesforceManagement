import { Module } from '@nestjs/common';

/**
 * AuthModule is intentionally a minimal stub.
 *
 * Authentication for this assignment is performed server-to-server against
 * Salesforce using the OAuth 2.0 client credentials grant. The backend holds and
 * refreshes Salesforce access tokens; no user-facing authentication, JWT
 * issuance, or route guards are implemented. Introducing user auth is
 * out of scope for the current requirements.
 */
@Module({})
export class AuthModule {}
