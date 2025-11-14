import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  Index,
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

  @Column({ unique: true })
  @Index()
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

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Message, (messages) => messages.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (messages) => messages.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Semester, (semester) => semester.author)
  semesters: Semester[];

  @OneToOne(() => Member, (member) => member.user)
  memberProfile: Member;
}
