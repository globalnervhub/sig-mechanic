import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';

@Module({
  controllers: [BrandsController, ModelsController],
  providers: [BrandsService, ModelsService],
})
export class VehicleCatalogModule {}
