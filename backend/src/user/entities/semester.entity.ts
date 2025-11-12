import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// [수정됨] 임포트 경로 수정 (users.entity -> user.entity)
import { User } from './user.entity';

@Entity({ name: 'semester' })
export class Semester {
  @PrimaryGeneratedColumn()
  id: number;

  // [수정됨] user.semesters를 참조
  @ManyToOne(() => User, (user) => user.semesters)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  imageUrl: string;
}
