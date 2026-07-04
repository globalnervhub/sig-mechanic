import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { BudgetItemType } from '@prisma/client';

export class BudgetItemDto {
  @IsEnum(BudgetItemType)
  type!: BudgetItemType;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateBudgetDto {
  @IsString()
  clientId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  items!: BudgetItemDto[];
}
