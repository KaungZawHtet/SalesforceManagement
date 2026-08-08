import { Test } from '@nestjs/testing';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import type { Server } from 'net';
import request from 'supertest';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { SalesforceService } from '../salesforce/salesforce.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import type { Account, AccountListResponse } from './types/account';
import type { CreateAccountDto } from './dto/create-account.dto';

interface MockedSalesforceService {
  listAccounts: jest.MockedFunction<
    (limit?: number) => Promise<AccountListResponse>
  >;
  createAccount: jest.MockedFunction<
    (input: CreateAccountDto) => Promise<Account>
  >;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
}

describe('AccountsController', () => {
  let app: INestApplication;
  let httpServer: Server;
  let salesforceService: MockedSalesforceService;

  beforeEach(async () => {
    salesforceService = {
      listAccounts: jest.fn(),
      createAccount: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        AccountsService,
        { provide: SalesforceService, useValue: salesforceService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/accounts returns 200 with data and meta', async () => {
    salesforceService.listAccounts.mockResolvedValue({
      data: [{ id: '1', name: 'Acme' }],
      meta: { total: 1, limit: 100, offset: 0 },
    });

    const res = await request(httpServer).get('/api/accounts?limit=50');
    const body = res.body as AccountListResponse;

    expect(res.status).toBe(200);
    expect(body).toEqual({
      data: [{ id: '1', name: 'Acme' }],
      meta: { total: 1, limit: 100, offset: 0 },
    });
    expect(salesforceService.listAccounts).toHaveBeenCalledWith(50);
  });

  it('GET /api/accounts without a limit delegates undefined', async () => {
    salesforceService.listAccounts.mockResolvedValue({
      data: [],
      meta: { total: 0, limit: 100, offset: 0 },
    });

    const res = await request(httpServer).get('/api/accounts');
    const body = res.body as AccountListResponse;

    expect(res.status).toBe(200);
    expect(body).toEqual({
      data: [],
      meta: { total: 0, limit: 100, offset: 0 },
    });
    expect(salesforceService.listAccounts).toHaveBeenCalledWith(undefined);
  });

  it('POST /api/accounts returns 201 with the created account', async () => {
    salesforceService.createAccount.mockResolvedValue({
      id: '001',
      name: 'Acme',
      phone: '123',
    });

    const res = await request(httpServer).post('/api/accounts').send({
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
    });
    const body = res.body as { data: Account };

    expect(res.status).toBe(201);
    expect(body).toMatchObject({ data: { id: '001' } });
    expect(salesforceService.createAccount.mock.calls[0][0]).toEqual({
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
    });
  });

  it('rejects unknown properties with a 400 and an errors list', async () => {
    const res = await request(httpServer)
      .post('/api/accounts')
      .send({ name: 'Acme', evil: 'x' });
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.message).toBe('Bad request');
    expect(body.errors).toBeDefined();
    expect(Array.isArray(body.errors)).toBe(true);
  });

  it('requires an account name (400)', async () => {
    const res = await request(httpServer)
      .post('/api/accounts')
      .send({ phone: '123' });
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it('trims the name before delegating', async () => {
    salesforceService.createAccount.mockResolvedValue({
      id: '001',
      name: 'Acme',
    });

    await request(httpServer)
      .post('/api/accounts')
      .send({ name: '   Acme   ' });

    expect(salesforceService.createAccount.mock.calls[0][0].name).toBe('Acme');
  });

  it('exposes the created record id for future lookups', async () => {
    salesforceService.createAccount.mockResolvedValue({
      id: '001new',
      name: 'Acme',
    });

    const res = await request(httpServer)
      .post('/api/accounts')
      .send({ name: 'Acme' });
    const body = res.body as { data: Account };

    expect(res.status).toBe(201);
    expect(body.data.id).toBe('001new');
  });
});
