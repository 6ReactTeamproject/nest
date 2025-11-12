import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/user/entities/members.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
