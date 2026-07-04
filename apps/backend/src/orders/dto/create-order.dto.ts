import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class OrderServiceItemDto {
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsString()
  mechanicId?: string;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class OrderPartItemDto {
  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateOrderDto {
  @IsString()
  clientId!: string;

  @IsString()
  vehicleId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => OrderServiceItemDto)
  services?: OrderServiceItemDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => OrderPartItemDto)
  items?: OrderPartItemDto[];
}
