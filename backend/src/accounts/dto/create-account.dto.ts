import ***REMOVED*** Transform ***REMOVED*** from 'class-transformer';
import ***REMOVED***
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
***REMOVED*** from 'class-validator';

function trimValue(***REMOVED*** value ***REMOVED***: ***REMOVED*** value: unknown ***REMOVED***): unknown ***REMOVED***
  return typeof value === 'string' ? value.trim() : value;
***REMOVED***

export class CreateAccountDto ***REMOVED***
  @IsString()
  @IsNotEmpty(***REMOVED*** message: 'Account name is required' ***REMOVED***)
  @MinLength(1, ***REMOVED*** message: 'Account name must not be empty' ***REMOVED***)
  @MaxLength(255, ***REMOVED*** message: 'Account name must not exceed 255 characters' ***REMOVED***)
  @Transform(trimValue)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, ***REMOVED*** message: 'Phone must not exceed 255 characters' ***REMOVED***)
  @Transform(trimValue)
  phone?: string;

  @IsOptional()
  @IsUrl(***REMOVED******REMOVED***, ***REMOVED*** message: 'Website must be a valid URL' ***REMOVED***)
  @Transform(trimValue)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, ***REMOVED*** message: 'Industry must not exceed 255 characters' ***REMOVED***)
  @Transform(trimValue)
  industry?: string;
***REMOVED***
