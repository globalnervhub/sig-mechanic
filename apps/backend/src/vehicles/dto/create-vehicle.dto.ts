import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  clientId!: string;

  @IsString()
  @MaxLength(60)
  brand!: string;

  @IsString()
  @MaxLength(60)
  model!: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  fuel?: string;

  @IsOptional()
  @IsString()
  engine?: string;

  @IsString()
  @MaxLength(10)
  plate!: string;

  @IsOptional()
  @IsString()
  chassis?: string;

  @IsOptional()
  @IsString()
  renavam?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentKm?: number;
}
