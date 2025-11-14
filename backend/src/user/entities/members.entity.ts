import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'members' })
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.memberProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column()
  name: string;

  @Column('text')
  introduction: string;

  @Column({ nullable: true })
  imageUrl: string;
}
