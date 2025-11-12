import { Injectable, NotFoundException } from '@nestjs/common';
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

  // 단일 메시지 조회
  async getOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  // 메시지 생성
  async create(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(data);
    return await this.messageRepository.save(message);
  }

  // 메시지 수정 (예: 읽음 처리 등)
  async update(id: number, data: Partial<Message>): Promise<Message> {
    await this.messageRepository.update(id, data);
    return this.getOne(id);
  }

  // 메시지 삭제
  async remove(id: number): Promise<void> {
    await this.messageRepository.delete(id);
  }

  // 특정 유저가 받은 메시지 조회
  async getReceivedMessages(receiverId: number): Promise<Message[]> {
    return await this.messageRepository.find({ where: { receiverId } });
  }

  // 특정 유저가 보낸 메시지 조회
  async getSentMessages(senderId: number): Promise<Message[]> {
    return await this.messageRepository.find({ where: { senderId } });
  }

  async ww(): Promise<Partial<Message>[]> {
    return await this.messageRepository.find({
      select: ['id', 'title', 'content', 'createdAt'],
    });
  }
}
