import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SemesterModule } from './semester/semester.module';
import { CommentsModule } from './comments/comments.module';
import { MembersModule } from './members/members.module';
import { MessageModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역으로 설정하여 모든 모듈에서 사용 가능
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'user',
      password: '1234',
      database: 'db',
      charset: 'utf8mb4',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      extra: {
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
        connectionLimit: 10,
      },
      logging: false,
    }),
    PostsModule,
    UserModule,
    SemesterModule,
    CommentsModule,
    MembersModule,
    MessageModule,
    AuthModule,
  ],
})
export class AppModule {}
