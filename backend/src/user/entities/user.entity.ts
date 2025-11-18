/**
 * 사용자 엔티티
 * 데이터베이스의 users 테이블과 매핑되는 엔티티입니다.
 * 
 * 왜 필요한가?
 * - 데이터베이스 스키마 정의: 사용자 정보의 구조를 명확히 정의
 * - TypeORM 관계 설정: 다른 엔티티(게시글, 댓글 등)와의 관계 정의
 * - 타입 안전성: TypeScript로 사용자 데이터의 타입 보장
 */

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

// Entity 데코레이터: TypeORM이 이 클래스를 데이터베이스 테이블로 인식
// name: 'users' - 데이터베이스 테이블 이름 지정
@Entity({ name: 'users' })
export class User {
  // 기본 키: 자동 증가하는 고유 ID
  // 왜 필요한가? 각 사용자를 고유하게 식별하기 위해
  @PrimaryGeneratedColumn()
  id: number;

  // 로그인 ID: 사용자가 로그인할 때 사용하는 고유한 식별자
  // unique: true - 중복 방지 (같은 아이디로 여러 계정 생성 불가)
  // unique: true는 자동으로 UNIQUE INDEX를 생성하므로 @Index()는 불필요
  // 왜 인덱스가 필요한가? 로그인 시 아이디로 조회하는 경우가 많으므로
  @Column({ unique: true })
  loginId: string;

  // 비밀번호: 해시된 비밀번호 저장
  // 왜 해시된 비밀번호인가? 평문 비밀번호를 저장하면 보안 위험
  @Column()
  password: string;

  // 사용자 이름: 표시용 이름
  @Column()
  name: string;

  // 프로필 이미지 URL (선택적)
  // nullable: true - 이미지가 없어도 됨
  @Column({ nullable: true })
  image: string;

  // Git URL (선택적)
  // nullable: true - Git URL이 없어도 됨
  @Column({ nullable: true })
  giturl: string;

  // OneToMany 관계: 한 사용자는 여러 게시글을 작성할 수 있음
  // 왜 필요한가? 사용자의 게시글 목록을 쉽게 조회하기 위해
  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

  // OneToMany 관계: 한 사용자는 여러 댓글을 작성할 수 있음
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // OneToMany 관계: 한 사용자는 여러 쪽지를 보낼 수 있음
  @OneToMany(() => Message, (messages) => messages.sender)
  sentMessages: Message[];

  // OneToMany 관계: 한 사용자는 여러 쪽지를 받을 수 있음
  @OneToMany(() => Message, (messages) => messages.receiver)
  receivedMessages: Message[];

  // OneToMany 관계: 한 사용자는 여러 여행지 소개를 작성할 수 있음
  @OneToMany(() => Semester, (semester) => semester.author)
  semesters: Semester[];

  // OneToOne 관계: 한 사용자는 하나의 멤버 소개만 가질 수 있음
  // 왜 OneToOne인가? 한 사용자는 하나의 멤버 소개만 작성할 수 있으므로
  @OneToOne(() => Member, (member) => member.user)
  memberProfile: Member;
}
