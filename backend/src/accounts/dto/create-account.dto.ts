import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimValue({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Account name is required' })
  @MinLength(1, { message: 'Account name must not be empty' })
  @MaxLength(255, { message: 'Account name must not exceed 255 characters' })
  @Transform(trimValue)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Phone must not exceed 255 characters' })
  @Transform(trimValue)
  phone?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  @Transform(trimValue)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Industry must not exceed 255 characters' })
  @Transform(trimValue)
  industry?: string;
}
