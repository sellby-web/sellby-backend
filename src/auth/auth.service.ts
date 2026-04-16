import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.validateUser(signInDto.email, signInDto.password);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  getCookieName() {
    return this.configService.get<string>('AUTH_COOKIE_NAME', 'Authentication');
  }

  getCookieOptions() {
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
