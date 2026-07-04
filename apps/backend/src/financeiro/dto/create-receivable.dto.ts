import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReceivableDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
