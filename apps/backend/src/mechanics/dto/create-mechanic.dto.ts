import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateMechanicDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercent?: number;
}
