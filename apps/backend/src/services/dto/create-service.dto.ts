import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  avgTimeMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  warrantyDays?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
