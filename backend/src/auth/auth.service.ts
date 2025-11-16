/**
 * 인증 관련 비즈니스 로직 서비스
 * 사용자 인증, 토큰 관리, 회원가입 등의 핵심 기능을 처리합니다.
 */

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

  /**
   * 사용자 검증 (로그인 시)
   * 아이디와 비밀번호를 확인하여 사용자를 인증합니다.
   * 
   * 왜 필요한가?
   * - 로그인 시 사용자 인증의 핵심 로직
   * - 비밀번호 검증: 해시된 비밀번호와 입력한 평문 비밀번호 비교
   * - 보안: 비밀번호는 절대 반환하지 않음
   * 
   * @param loginId 사용자 아이디
   * @param password 사용자 비밀번호 (평문)
   * @returns 인증 성공 시 사용자 정보 (비밀번호 제외), 실패 시 null
   */
  async validateUser(loginId: string, password: string): Promise<User | null> {
    // 아이디로 사용자 조회: 해당 아이디를 가진 사용자가 있는지 확인
    const user = await this.userRepository.findOne({
      where: { loginId },
    });

    // 사용자가 존재하지 않으면 null 반환
    // 왜 null을 반환하나? 에러를 던지지 않고 null로 실패를 표현 (호출자가 처리)
    if (!user) {
      return null;
    }

    // 비밀번호 비교: 입력한 평문 비밀번호와 저장된 해시 비밀번호 비교
    // bcrypt.compare: 평문 비밀번호와 해시된 비밀번호를 비교
    // 왜 compare를 사용하나? 해시된 비밀번호는 복호화할 수 없으므로 비교만 가능
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // 비밀번호가 일치하지 않으면 null 반환
    if (!isPasswordValid) {
      return null;
    }

    // 비밀번호를 제외한 사용자 정보 반환
    // 구조 분해 할당으로 password 필드 제외
    // 왜 제외하나? 보안상 비밀번호는 절대 응답에 포함하지 않음
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 리프레시 토큰 생성
   * 새로운 리프레시 토큰을 생성하고 데이터베이스에 저장합니다.
   * 한 사용자당 하나의 리프레시 토큰만 유지하도록 기존 토큰을 삭제합니다.
   * 
   * 왜 필요한가?
   * - 액세스 토큰이 만료되었을 때 새 토큰을 발급받기 위해
   * - 한 사용자당 하나만 유지: 보안상 여러 기기에서 로그인해도 최신 토큰만 유효
   * - private 메서드: 외부에서 직접 호출하지 않고 내부에서만 사용
   * 
   * @param userId 사용자 ID
   * @returns 생성된 리프레시 토큰 문자열
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    // 기존 리프레시 토큰 삭제 (한 사용자당 하나의 리프레시 토큰만 유지)
    // 왜 삭제하나? 보안상 한 사용자가 여러 기기에서 로그인해도 최신 토큰만 유효하게 하기 위해
    await this.refreshTokenRepository.delete({ userId });

    // 새 리프레시 토큰 생성 (64바이트 랜덤 문자열을 16진수로 변환)
    // crypto.randomBytes: 암호학적으로 안전한 랜덤 바이트 생성
    // 64바이트: 충분히 긴 토큰으로 무작위 대입 공격 방지
    // toString('hex'): 16진수 문자열로 변환 (128자 길이)
    // 왜 이렇게 하나? 예측 불가능한 토큰을 생성하여 보안 강화
    const token = crypto.randomBytes(64).toString('hex');
    
    // 환경 변수에서 토큰 만료 시간 가져오기 (기본값: 7일)
    // ConfigService: 환경 변수에서 설정값 가져오기
    // 왜 환경 변수를 사용하나? 배포 환경에 따라 만료 시간을 다르게 설정할 수 있음
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
    const expiresAt = new Date();
    
    // expiresIn 파싱 (예: '7d', '30d', '24h')
    // endsWith('d'): 일 단위인지 확인
    if (expiresIn.endsWith('d')) {
      // parseInt + slice: 숫자 부분만 추출 (예: '7d' -> 7)
      const days = parseInt(expiresIn.slice(0, -1));
      // setDate: 현재 날짜에 일수 추가
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (expiresIn.endsWith('h')) {
      // 시간 단위 처리
      const hours = parseInt(expiresIn.slice(0, -1));
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else {
      // 기본값: 7일 (형식이 맞지 않으면 기본값 사용)
      // 왜 기본값이 필요한가? 잘못된 설정값이 와도 동작하도록 방어적 처리
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    // 리프레시 토큰 엔티티 생성 및 저장
    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    // 데이터베이스에 저장
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  /**
   * 리프레시 토큰 검증 및 새 액세스 토큰 발급
   * 리프레시 토큰이 유효한지 확인하고, 유효하면 새로운 액세스 토큰을 발급합니다.
   * 
   * 왜 필요한가?
   * - 액세스 토큰이 만료되었을 때 사용자가 다시 로그인하지 않고 새 토큰을 받을 수 있게 함
   * - 사용자 경험 향상: 자동으로 토큰 갱신하여 끊김 없는 서비스 이용
   * 
   * @param refreshToken 리프레시 토큰 문자열
   * @returns 새로운 액세스 토큰과 사용자 정보
   * @throws UnauthorizedException 리프레시 토큰이 유효하지 않거나 만료된 경우
   */
  async refreshAccessToken(refreshToken: string) {
    // 리프레시 토큰과 연관된 사용자 정보 조회
    // relations: ['user']: 연관된 사용자 정보도 함께 조회
    // 왜 relations가 필요한가? 사용자 정보를 토큰에 포함시키기 위해
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    // 토큰이 존재하지 않으면 예외 발생
    // 왜 필요한가? 유효하지 않은 토큰으로 접근하는 것을 차단
    if (!tokenRecord) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    // 만료 확인: 현재 시간이 만료 시간보다 늦으면 만료됨
    // 왜 필요한가? 만료된 토큰은 사용할 수 없으므로 검증 필수
    if (new Date() > tokenRecord.expiresAt) {
      // 만료된 토큰은 삭제: 데이터베이스 정리
      // 왜 삭제하나? 만료된 토큰을 계속 보관하면 불필요한 데이터 축적
      await this.refreshTokenRepository.delete({ id: tokenRecord.id });
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }

    // 새 액세스 토큰 생성 (JWT 페이로드에 사용자 ID와 로그인 ID 포함)
    // payload: JWT에 포함될 정보 (민감한 정보는 제외)
    // 왜 이 정보만 포함하나? 토큰 크기 최소화 및 보안을 위해 최소한의 정보만
    const payload = { userId: tokenRecord.userId, loginId: tokenRecord.user.loginId };
    // jwtService.sign: JWT 토큰 생성
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      // 사용자 정보 반환: 클라이언트가 사용자 정보를 업데이트할 수 있게 함
      user: {
        id: tokenRecord.user.id,
        loginId: tokenRecord.user.loginId,
        name: tokenRecord.user.name,
        image: tokenRecord.user.image,
        giturl: tokenRecord.user.giturl,
      },
    };
  }

  /**
   * 로그아웃 처리
   * 리프레시 토큰을 데이터베이스에서 삭제하여 로그아웃을 처리합니다.
   * 
   * 왜 필요한가?
   * - 사용자가 로그아웃하면 해당 기기의 리프레시 토큰을 무효화
   * - 보안: 토큰 삭제로 해당 기기에서 자동 로그인 방지
   * - 액세스 토큰은 만료되면 자동으로 무효화되므로 리프레시 토큰만 삭제
   * 
   * @param refreshToken 삭제할 리프레시 토큰
   */
  async logout(refreshToken: string): Promise<void> {
    // 리프레시 토큰 삭제
    // 왜 리프레시 토큰만 삭제하나? 액세스 토큰은 짧은 수명이므로 자동 만료, 리프레시 토큰은 수동 삭제 필요
    await this.refreshTokenRepository.delete({ token: refreshToken });
  }

  /**
   * 로그인 처리
   * 사용자 인증 후 JWT 액세스 토큰과 리프레시 토큰을 발급합니다.
   * 
   * 왜 필요한가?
   * - 사용자 인증의 핵심 기능: 아이디와 비밀번호로 로그인
   * - 두 가지 토큰 발급: 액세스 토큰(짧은 수명)과 리프레시 토큰(긴 수명)
   * - 액세스 토큰: API 요청 시 사용 (자주 만료)
   * - 리프레시 토큰: 액세스 토큰 갱신 시 사용 (드물게 만료)
   * 
   * @param loginDto 로그인 정보 (아이디, 비밀번호)
   * @returns 액세스 토큰, 리프레시 토큰, 사용자 정보
   * @throws UnauthorizedException 로그인 정보가 올바르지 않은 경우
   */
  async login(loginDto: LoginDto) {
    // 사용자 인증: 아이디와 비밀번호 확인
    // validateUser: 비밀번호 해시 비교 등 인증 로직 처리
    const user = await this.validateUser(loginDto.loginId, loginDto.password);
    // 인증 실패 시 에러
    // 왜 필요한가? 잘못된 로그인 정보로 접근하는 것을 차단
    if (!user) {
      throw new UnauthorizedException('로그인 정보가 올바르지 않습니다.');
    }

    // JWT 페이로드 생성: 토큰에 포함될 정보
    // 최소한의 정보만 포함: 보안과 토큰 크기 최소화를 위해
    const payload = { userId: user.id, loginId: user.loginId };
    
    // 리프레시 토큰 생성: 액세스 토큰 갱신용
    const refresh_token = await this.generateRefreshToken(user.id);

    return {
      // 액세스 토큰 발급: API 요청 시 사용
      // jwtService.sign: JWT 토큰 생성 (서명 포함)
      access_token: this.jwtService.sign(payload),
      refresh_token,
      // 사용자 정보 반환: 클라이언트가 사용자 정보를 저장할 수 있게 함
      // 비밀번호는 제외: 보안상 비밀번호는 절대 반환하지 않음
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        image: user.image,
        giturl: user.giturl,
      },
    };
  }

  /**
   * 회원가입 처리
   * 새로운 사용자를 등록하고 JWT 토큰을 발급합니다.
   * 
   * 왜 필요한가?
   * - 새로운 사용자를 시스템에 등록하는 핵심 기능
   * - 회원가입 후 자동 로그인: 사용자 경험 향상을 위해 토큰 발급
   * - 보안: 비밀번호 해싱, 아이디 중복 체크 필수
   * 
   * @param registerDto 회원가입 정보
   * @returns 액세스 토큰, 리프레시 토큰, 사용자 정보
   * @throws ConflictException 이미 존재하는 아이디인 경우
   */
  async register(registerDto: RegisterDto) {
    // 아이디 중복 체크: 같은 아이디가 이미 존재하는지 확인
    // 왜 필요한가? 같은 아이디로 여러 계정을 만들 수 없게 하기 위해
    const existingUser = await this.userRepository.findOne({
      where: { loginId: registerDto.loginId },
    });

    // 중복된 아이디가 있으면 에러
    // ConflictException (409): 리소스 충돌을 나타내는 HTTP 상태 코드
    if (existingUser) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    // 비밀번호 해싱: 평문 비밀번호를 해시로 변환
    // bcrypt.hash: 비밀번호를 해시로 변환 (salt rounds: 10)
    // 왜 해싱이 필요한가? 평문 비밀번호를 저장하면 보안 위험 (DB 유출 시 비밀번호 노출)
    // salt rounds 10: 해싱 강도 (높을수록 안전하지만 느림, 10은 적절한 균형)
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 사용자 엔티티 생성: 메모리상 객체 생성 (아직 DB에 저장 안 됨)
    // 스프레드 연산자: registerDto의 모든 속성을 복사
    // password: 해시된 비밀번호로 교체
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword, // 해시된 비밀번호로 저장
    });

    // 사용자 저장: 데이터베이스에 실제로 저장
    const savedUser = await this.userRepository.save(user);

    // JWT 토큰 생성: 회원가입 후 자동 로그인을 위해
    const payload = { userId: savedUser.id, loginId: savedUser.loginId };
    const refresh_token = await this.generateRefreshToken(savedUser.id);

    return {
      // 액세스 토큰 발급: API 요청 시 사용
      access_token: this.jwtService.sign(payload),
      refresh_token,
      // 사용자 정보 반환: 클라이언트가 사용자 정보를 저장할 수 있게 함
      // 비밀번호는 제외: 보안상 비밀번호는 절대 반환하지 않음
      user: {
        id: savedUser.id,
        loginId: savedUser.loginId,
        name: savedUser.name,
        image: savedUser.image,
        giturl: savedUser.giturl,
      },
    };
  }

  /**
   * 아이디 중복 확인
   * 주어진 아이디가 이미 사용 중인지 확인합니다.
   * 
   * 왜 필요한가?
   * - 회원가입 전에 아이디 사용 가능 여부를 미리 확인
   * - 사용자 경험 향상: 회원가입 폼에서 실시간으로 중복 확인 가능
   * - 인증 불필요: 공개 정보이므로 누구나 확인 가능
   * 
   * @param loginId 확인할 아이디
   * @returns 중복 여부 (exists: boolean)
   */
  async checkIdExists(loginId: string) {
    // 아이디로 사용자 조회
    const user = await this.userRepository.findOne({
      where: { loginId },
    });
    // !!user: truthy/falsy를 boolean으로 변환
    // 사용자가 존재하면 true, 없으면 false
    // 왜 이렇게 하나? 명시적으로 boolean 값을 반환하여 API 응답을 명확하게 함
    return { exists: !!user };
  }
}

