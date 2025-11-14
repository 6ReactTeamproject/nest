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

  // 전체 메시지 조회
  async getAll(): Promise<Message[]> {
    return await this.messageRepository.find();
  }

  // 메시지 생성
  async create(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(data);
    return await this.messageRepository.save(message);
  }

  // 메시지 수정 (예: 읽음 처리 등, 본인 메시지만)
  async update(
    id: number,
    data: Partial<Message>,
    userId: number,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    // 발신자나 수신자만 수정 가능
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('본인의 메시지만 수정할 수 있습니다.');
    }
    await this.messageRepository.update(id, data);
    // 업데이트 후 업데이트된 메시지 반환
    return this.getOne(id);
  }

  // 단일 메시지 조회 (내부 사용)
  private async getOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }
}
