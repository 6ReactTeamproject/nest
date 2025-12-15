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
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'user',
      password: '1234',
      database: 'db',
      charset: 'utf8mb4',
      entities: [__dirname + '*.entity{.ts,.js}'],
      synchronize: false,
      extra: {
        charset: 'utf8mb4',
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
    ChatModule,
    UploadModule,
  ],
})
export class AppModule {}
