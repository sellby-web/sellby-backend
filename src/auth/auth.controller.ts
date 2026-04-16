import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.signUp(createUserDto);
    const { accessToken } = await this.authService.signIn({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    res.cookie(
      this.authService.getCookieName(),
      accessToken,
      this.authService.getCookieOptions(),
    );
    return { user };
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.signIn(signInDto);
    res.cookie(
      this.authService.getCookieName(),
      accessToken,
      this.authService.getCookieOptions(),
    );
    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(
      this.authService.getCookieName(),
      this.authService.getCookieOptions(),
    );
    return { message: 'Logged out successfully' };
  }
}
