import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
