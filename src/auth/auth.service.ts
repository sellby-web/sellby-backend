import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AppLogger, RequestMeta } from 'src/common/logger/app-logger';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async signUp(createUserDto: CreateUserDto, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('AuthService', 'signUp called', meta, { email: createUserDto.email });
    const result = await this.userService.create(createUserDto, meta);
    this.logger.info('AuthService', 'signUp done', meta, { userId: result.id });
    return result;
  }

  async signIn(signInDto: SignInDto, meta?: RequestMeta): Promise<{ accessToken: string; user: UserResponseDto }> {
    this.logger.info('AuthService', 'signIn called', meta, { email: signInDto.email });
    const user = await this.validateUser(signInDto.email, signInDto.password, meta);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    this.logger.info('AuthService', 'signIn done', meta, { userId: user.id });
    return { accessToken: token, user };
  }

  async validateUser(email: string, password: string, meta?: RequestMeta): Promise<UserResponseDto> {
    this.logger.info('AuthService', 'validateUser called', meta, { email });
    const user = await this.userService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _password, ...sanitizedUser } = user;
    this.logger.info('AuthService', 'validateUser done', meta, { email });
    return sanitizedUser as UserResponseDto;
  }

  getCookieName(): string {
    return this.configService.get<string>('AUTH_COOKIE_NAME', 'Authentication');
  }

  getCookieOptions(): { httpOnly: boolean; secure: boolean; sameSite: 'lax' | 'strict' | 'none'; maxAge: number; path: string } {
    const secure =
      this.configService.get<string>('COOKIE_SECURE', '') === 'true' ||
      this.configService.get<string>('NODE_ENV') === 'production';
    const maxAge = Number(
      this.configService.get<string>('COOKIE_MAX_AGE', '86400000'),
    );

    return {
      httpOnly: true,
      secure,
      sameSite: this.configService.get<string>('COOKIE_SAMESITE', 'lax') as
        | 'lax'
        | 'strict'
        | 'none',
      maxAge,
      path: '/',
    };
  }
}
