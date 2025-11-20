import { Module } from '@nestjs/common';
import { ObjectController } from './controllers/object.controller';
import { ObjectService } from './services/object.service';
import { ObjectRepository } from './repositories/object.repository';

@Module({
  controllers: [ObjectController],
  providers: [ObjectService, ObjectRepository],
  exports: [ObjectService],
})
export class ObjectModule {}

