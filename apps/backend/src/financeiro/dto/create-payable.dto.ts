import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayableDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
