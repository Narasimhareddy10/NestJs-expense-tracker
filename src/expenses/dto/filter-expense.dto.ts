import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class FilterExpenseDto {
  private static emptyToUndefined(value: unknown): unknown {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  }

  private static emptyToNumber(value: unknown): unknown {
    const normalized = FilterExpenseDto.emptyToUndefined(value);
    if (normalized === undefined) {
      return undefined;
    }

    const num = Number(normalized);
    return Number.isNaN(num) ? normalized : num;
  }

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToUndefined(value))
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToUndefined(value))
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToUndefined(value))
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToNumber(value))
  @IsNumber()
  @IsPositive()
  minAmount?: number;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToNumber(value))
  @IsNumber()
  @IsPositive()
  maxAmount?: number;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToUndefined(value))
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToNumber(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => FilterExpenseDto.emptyToNumber(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
