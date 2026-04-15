import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  monthlyIncome: number;

  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications: boolean;
}
