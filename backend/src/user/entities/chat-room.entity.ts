import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';
import { ChatRoomParticipant } from './chat-room-participant.entity';

@Entity({ name: 'chat_rooms' })
export class ChatRoom {
  @PrimaryColumn({ length: 50 })
  roomId: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdBy' })
  @Index()
  creator: User;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

  @OneToMany(() => ChatRoomParticipant, (participant) => participant.room)
  participants: ChatRoomParticipant[];
}
