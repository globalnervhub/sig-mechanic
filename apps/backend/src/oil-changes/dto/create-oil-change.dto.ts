import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateOilChangeDto {
  @IsString()
  vehicleId!: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsDateString()
  changeDate!: string;

  @IsInt()
  @Min(0)
  currentKm!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  nextChangeKm?: number;

  @IsOptional()
  @IsDateString()
  nextChangeDate?: string;

  @IsOptional()
  @IsString()
  oilType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
