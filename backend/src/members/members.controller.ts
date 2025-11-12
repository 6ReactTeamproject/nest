import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from 'src/user/entities/members.entity';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(): Promise<Member[]> {
    return this.membersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Member> {
    return this.membersService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    createData: {
      userId: number;
      name: string;
      introduction: string;
      imageUrl?: string;
    },
  ): Promise<Member> {
    return this.membersService.create(createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateData: Partial<Member>,
  ): Promise<Member> {
    return this.membersService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.membersService.remove(id);
  }

  @Get('info')
  async ee() {
    const result = await this.membersService.ee();
    return {
      message: 'Member의 기본 정보(id, name, imageUrl, introduction, authorId)',
      data: result,
    };
  }
}
