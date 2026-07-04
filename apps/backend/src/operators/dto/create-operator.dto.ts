import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOperatorDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
