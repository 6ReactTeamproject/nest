import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from 'src/user/entities/semester.entity';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}
