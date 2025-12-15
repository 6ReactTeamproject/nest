import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'semester' })
export class Semester {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.semesters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  @Index()
  author: User;

  @Column()
  authorId: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
