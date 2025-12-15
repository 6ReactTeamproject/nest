import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from '../user/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(loginId: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { loginId },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    await this.refreshTokenRepository.delete({ userId });

    const token = crypto.randomBytes(64).toString('hex');
    
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
    const expiresAt = new Date();
    
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1));
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1));
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      await this.refreshTokenRepository.delete({ id: tokenRecord.id });
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }

    const payload = { userId: tokenRecord.userId, loginId: tokenRecord.user.loginId };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: tokenRecord.user.id,
        loginId: tokenRecord.user.loginId,
        name: tokenRecord.user.name,
        image: tokenRecord.user.image,
        giturl: tokenRecord.user.giturl,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token: refreshToken });
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.loginId, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('로그인 정보가 올바르지 않습니다.');
    }

    const payload = { userId: user.id, loginId: user.loginId };
    
    const refresh_token = await this.generateRefreshToken(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        image: user.image,
        giturl: user.giturl,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { loginId: registerDto.loginId },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const defaultImageURL = 'https://i.ibb.co/Fz1bk4g/default-profile.png';

    const user = this.userRepository.create({
      loginId: registerDto.loginId,
      password: hashedPassword,
      name: registerDto.name,
      image: defaultImageURL,
    });

    const savedUser = await this.userRepository.save(user);

    const payload = { userId: savedUser.id, loginId: savedUser.loginId };
    const refresh_token = await this.generateRefreshToken(savedUser.id);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      user: {
        id: savedUser.id,
        loginId: savedUser.loginId,
        name: savedUser.name,
        image: savedUser.image,
        giturl: savedUser.giturl,
      },
    };
  }

  async checkIdExists(loginId: string) {
    const user = await this.userRepository.findOne({
      where: { loginId },
    });
    return { exists: !!user };
  }
}

