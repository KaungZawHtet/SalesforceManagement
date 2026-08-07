import ***REMOVED*** validate ***REMOVED*** from 'class-validator';
import ***REMOVED*** plainToInstance ***REMOVED*** from 'class-transformer';
import ***REMOVED*** CreateAccountDto ***REMOVED*** from './create-account.dto';

describe('CreateAccountDto', () => ***REMOVED***
  it('passes validation for a complete valid account', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED***
      name: 'Acme Corp',
      phone: '0123456789',
      website: 'https://acme.com',
      industry: 'Technology',
***REMOVED***);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  ***REMOVED***);

  it('passes validation with only the required name', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED*** name: 'Acme Corp' ***REMOVED***);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  ***REMOVED***);

  it('requires a name', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED*** phone: '0123' ***REMOVED***);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  ***REMOVED***);

  it('trims whitespace from the name', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED*** name: '  Acme Corp  ' ***REMOVED***);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.name).toBe('Acme Corp');
  ***REMOVED***);

  it('trims and ignores empty optional fields', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED***
      name: 'Acme',
      phone: '   ',
***REMOVED***);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.phone).toBe('');
  ***REMOVED***);

  it('rejects a name longer than 255 characters', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED*** name: 'a'.repeat(256) ***REMOVED***);
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  ***REMOVED***);

  it('rejects an invalid website URL', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED***
      name: 'Acme',
      website: 'not-a-url',
***REMOVED***);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('website');
  ***REMOVED***);

  it('rejects a non-string name', async () => ***REMOVED***
    const dto = plainToInstance(CreateAccountDto, ***REMOVED*** name: 12345 ***REMOVED***);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  ***REMOVED***);
***REMOVED***);
