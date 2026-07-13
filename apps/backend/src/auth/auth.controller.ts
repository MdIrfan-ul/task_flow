import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService, TokenPayload } from './auth.service';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from 'src/auth/guards/google.guard';
import { GitHubAuthGuard } from 'src/auth/guards/github.guard';
import { RegisterInput } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserType } from 'src/users/enums/user-enum';
import { JwtAuthGuard } from './guards';
interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) { }

  @Post('register')
  async registerUser(
    @Body() registerInput: RegisterInput
  ) {
    return await this.authService.registerUser(registerInput);
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginInput: LoginDto
  ) {
    const tokens = await this.authService.login(loginInput);
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { accessToken: tokens.accessToken, user: tokens.user };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  getHello(@Res() res: Response) { }

  private async callback(req: Request, res: Response) {
    const user = req.user as User;
    const tokens = await this.authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.user_type,
    });
    // Redirect to frontend with access token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${tokens.accessToken}`);
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async getGoogleCallback(@Req() req: Request, @Res() res: Response) {
    return this.callback(req, res);
  }

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  getGitHub(@Res() res: Response) { }

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  async getGitHubCallback(@Req() req: Request, @Res() res: Response) {
    return this.callback(req, res);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshAuth(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as TokenPayload;

    const tokens = await this.authService.generateTokens({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    // Rotate the refresh token cookie
    const ENV = this.configService.get<string>('ENVIRONMENT');
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: ENV === 'PRODUCTION',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('members')
  @UseGuards(JwtAuthGuard)
  @Roles(UserType.OWNER)
  createMember(
    @Req() req: AuthRequest,
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    return this.authService.createMember(
      email, name,
      req.user.userId,
    );
  }
}
