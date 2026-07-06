import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateModelDto {
  @IsString()
  brandId!: string;

  @IsString()
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
