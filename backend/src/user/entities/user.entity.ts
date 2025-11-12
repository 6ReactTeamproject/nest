import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Post } from './posts.entity';
import { Comment } from './comments.entity';
import { Message } from './messages.entity';
import { Semester } from './semester.entity';
import { Member } from './members.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loginId: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  giturl: string;

  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

  // [수정됨] 인자 이름을 'comments' -> 'comment'로 변경
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Message, (messages) => messages.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (messages) => messages.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Semester, (semester) => semester.author)
  semesters: Semester[];

  // [수정됨] Member 엔티티의 'author'가 아닌 'user' 속성을 참조
  @OneToOne(() => Member, (member) => member.user)
  memberProfile: Member;
}
