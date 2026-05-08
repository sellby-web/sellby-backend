import { Controller, Post, Body, Res, Req, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AppLogger } from 'src/common/logger/app-logger';
import { UserResponseDto } from '../user/dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user and receive a session cookie' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created; Authentication cookie set', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signUp(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
    // passthrough: true is required — without it NestJS hands full response control to this handler
    // and ignores the return value, resulting in an empty response body
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: UserResponseDto }> {
    this.logger.info('AuthController', 'signUp received', req.meta, { body: createUserDto });
    const user = await this.authService.signUp(createUserDto, req.meta);
    // sign in immediately after registration so the cookie is set in the same response
    const { accessToken } = await this.authService.signIn({
      email: createUserDto.email,
      password: createUserDto.password,
    }, req.meta);
    res.cookie(
      this.authService.getCookieName(),
      accessToken,
      this.authService.getCookieOptions(),
    );
    const result = { user };
    this.logger.info('AuthController', 'signUp response', req.meta, { result });
    return result;
  }

  @Post('signin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in and receive a session cookie' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Signed in; Authentication cookie set', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(
    @Req() req: Request,
    @Body() signInDto: SignInDto,
    // passthrough: true is required — without it NestJS hands full response control to this handler
    // and ignores the return value, resulting in an empty response body
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: UserResponseDto }> {
    this.logger.info('AuthController', 'signIn received', req.meta, { body: signInDto });
    const { accessToken, user } = await this.authService.signIn(signInDto, req.meta);
    res.cookie(
      this.authService.getCookieName(),
      accessToken,
      this.authService.getCookieOptions(),
    );
    const result = { user };
    this.logger.info('AuthController', 'signIn response', req.meta, { result });
    return result;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear the session cookie' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): { message: string } {
    this.logger.info('AuthController', 'logout received', req.meta);
    res.clearCookie(
      this.authService.getCookieName(),
      this.authService.getCookieOptions(),
    );
    const result = { message: 'Logged out successfully' };
    this.logger.info('AuthController', 'logout response', req.meta, { result });
    return result;
  }
}
