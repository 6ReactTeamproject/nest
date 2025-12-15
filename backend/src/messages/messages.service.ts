

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/user/entities/messages.entity';

@Injectable()
export class MessageService {
  constructor(
    
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getAll(): Promise<Message[]> {
    return await this.messageRepository.find();
  }

  async create(data: Partial<Message>): Promise<Message> {
    
    const message = this.messageRepository.create(data);
    
    return await this.messageRepository.save(message);
  }

  async update(
    id: number,
    data: Partial<Message>,
    userId: number,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('본인의 메시지만 수정할 수 있습니다.');
    }
    await this.messageRepository.update(id, data);
    
    return this.getOne(id);
  }

  private async getOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }
}
