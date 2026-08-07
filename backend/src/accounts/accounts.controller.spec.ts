import ***REMOVED*** Test ***REMOVED*** from '@nestjs/testing';
import ***REMOVED*** ValidationPipe, type INestApplication ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** Server ***REMOVED*** from 'net';
import request from 'supertest';
import ***REMOVED*** AccountsController ***REMOVED*** from './accounts.controller';
import ***REMOVED*** AccountsService ***REMOVED*** from './accounts.service';
import ***REMOVED*** SalesforceService ***REMOVED*** from '../salesforce/salesforce.service';
import ***REMOVED*** HttpExceptionFilter ***REMOVED*** from '../common/filters/http-exception.filter';
import type ***REMOVED*** Account, AccountListResponse ***REMOVED*** from './types/account';
import type ***REMOVED*** CreateAccountDto ***REMOVED*** from './dto/create-account.dto';

interface MockedSalesforceService ***REMOVED***
  listAccounts: jest.MockedFunction<
    (limit?: number) => Promise<AccountListResponse>
  >;
  createAccount: jest.MockedFunction<
    (input: CreateAccountDto) => Promise<Account>
  >;
***REMOVED***

interface ErrorResponse ***REMOVED***
  statusCode: number;
  message: string;
  errors?: string[];
***REMOVED***

describe('AccountsController', () => ***REMOVED***
  let app: INestApplication;
  let httpServer: Server;
  let salesforceService: MockedSalesforceService;

  beforeEach(async () => ***REMOVED***
    salesforceService = ***REMOVED***
      listAccounts: jest.fn(),
      createAccount: jest.fn(),
***REMOVED***;

    const moduleRef = await Test.createTestingModule(***REMOVED***
      controllers: [AccountsController],
      providers: [
        AccountsService,
        ***REMOVED*** provide: SalesforceService, useValue: salesforceService ***REMOVED***,
    ***REMOVED***,
***REMOVED***).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe(***REMOVED***
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: ***REMOVED*** enableImplicitConversion: false ***REMOVED***,
  ***REMOVED***),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    httpServer = app.getHttpServer() as Server;
  ***REMOVED***);

  afterEach(async () => ***REMOVED***
    await app.close();
  ***REMOVED***);

  it('GET /api/accounts returns 200 with data and meta', async () => ***REMOVED***
    salesforceService.listAccounts.mockResolvedValue(***REMOVED***
      data: [***REMOVED*** id: '1', name: 'Acme' ***REMOVED***],
      meta: ***REMOVED*** total: 1, limit: 100, offset: 0 ***REMOVED***,
***REMOVED***);

    const res = await request(httpServer).get('/api/accounts?limit=50');
    const body = res.body as AccountListResponse;

    expect(res.status).toBe(200);
    expect(body).toEqual(***REMOVED***
      data: [***REMOVED*** id: '1', name: 'Acme' ***REMOVED***],
      meta: ***REMOVED*** total: 1, limit: 100, offset: 0 ***REMOVED***,
***REMOVED***);
    expect(salesforceService.listAccounts).toHaveBeenCalledWith(50);
  ***REMOVED***);

  it('GET /api/accounts without a limit delegates undefined', async () => ***REMOVED***
    salesforceService.listAccounts.mockResolvedValue(***REMOVED***
      data: [],
      meta: ***REMOVED*** total: 0, limit: 100, offset: 0 ***REMOVED***,
***REMOVED***);

    const res = await request(httpServer).get('/api/accounts');
    const body = res.body as AccountListResponse;

    expect(res.status).toBe(200);
    expect(body).toEqual(***REMOVED***
      data: [],
      meta: ***REMOVED*** total: 0, limit: 100, offset: 0 ***REMOVED***,
***REMOVED***);
    expect(salesforceService.listAccounts).toHaveBeenCalledWith(undefined);
  ***REMOVED***);

  it('POST /api/accounts returns 201 with the created account', async () => ***REMOVED***
    salesforceService.createAccount.mockResolvedValue(***REMOVED***
      id: '001',
      name: 'Acme',
      phone: '123',
***REMOVED***);

    const res = await request(httpServer).post('/api/accounts').send(***REMOVED***
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
***REMOVED***);
    const body = res.body as ***REMOVED*** data: Account ***REMOVED***;

    expect(res.status).toBe(201);
    expect(body).toMatchObject(***REMOVED*** data: ***REMOVED*** id: '001' ***REMOVED*** ***REMOVED***);
    expect(salesforceService.createAccount.mock.calls[0][0]).toEqual(***REMOVED***
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
***REMOVED***);
  ***REMOVED***);

  it('rejects unknown properties with a 400 and an errors list', async () => ***REMOVED***
    const res = await request(httpServer)
      .post('/api/accounts')
      .send(***REMOVED*** name: 'Acme', evil: 'x' ***REMOVED***);
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.message).toBe('Bad request');
    expect(body.errors).toBeDefined();
    expect(Array.isArray(body.errors)).toBe(true);
  ***REMOVED***);

  it('requires an account name (400)', async () => ***REMOVED***
    const res = await request(httpServer)
      .post('/api/accounts')
      .send(***REMOVED*** phone: '123' ***REMOVED***);
    const body = res.body as ErrorResponse;

    expect(res.status).toBe(400);
    expect(body.errors).toBeDefined();
  ***REMOVED***);

  it('trims the name before delegating', async () => ***REMOVED***
    salesforceService.createAccount.mockResolvedValue(***REMOVED***
      id: '001',
      name: 'Acme',
***REMOVED***);

    await request(httpServer)
      .post('/api/accounts')
      .send(***REMOVED*** name: '   Acme   ' ***REMOVED***);

    expect(salesforceService.createAccount.mock.calls[0][0].name).toBe('Acme');
  ***REMOVED***);

  it('exposes the created record id for future lookups', async () => ***REMOVED***
    salesforceService.createAccount.mockResolvedValue(***REMOVED***
      id: '001new',
      name: 'Acme',
***REMOVED***);

    const res = await request(httpServer)
      .post('/api/accounts')
      .send(***REMOVED*** name: 'Acme' ***REMOVED***);
    const body = res.body as ***REMOVED*** data: Account ***REMOVED***;

    expect(res.status).toBe(201);
    expect(body.data.id).toBe('001new');
  ***REMOVED***);
***REMOVED***);
