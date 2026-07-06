import { Module } from '@nestjs/common';
import { OilChangesController } from './oil-changes.controller';
import { OilChangesService } from './oil-changes.service';

@Module({
  controllers: [OilChangesController],
  providers: [OilChangesService],
})
export class OilChangesModule {}
