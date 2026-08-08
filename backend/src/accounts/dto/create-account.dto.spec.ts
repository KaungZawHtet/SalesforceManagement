import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAccountDto } from './create-account.dto';

describe('CreateAccountDto', () => {
  it('passes validation for a complete valid account', async () => {
    const dto = plainToInstance(CreateAccountDto, {
      name: 'Acme Corp',
      phone: '0123456789',
      website: 'https://acme.com',
      industry: 'Technology',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes validation with only the required name', async () => {
    const dto = plainToInstance(CreateAccountDto, { name: 'Acme Corp' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('requires a name', async () => {
    const dto = plainToInstance(CreateAccountDto, { phone: '0123' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('trims whitespace from the name', async () => {
    const dto = plainToInstance(CreateAccountDto, { name: '  Acme Corp  ' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.name).toBe('Acme Corp');
  });

  it('trims and ignores empty optional fields', async () => {
    const dto = plainToInstance(CreateAccountDto, {
      name: 'Acme',
      phone: '   ',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.phone).toBe('');
  });

  it('rejects a name longer than 255 characters', async () => {
    const dto = plainToInstance(CreateAccountDto, { name: 'a'.repeat(256) });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('rejects an invalid website URL', async () => {
    const dto = plainToInstance(CreateAccountDto, {
      name: 'Acme',
      website: 'not-a-url',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('website');
  });

  it('rejects a non-string name', async () => {
    const dto = plainToInstance(CreateAccountDto, { name: 12345 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
