import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from 'src/auth/guards/google.guard';
import { GitHubAuthGuard } from 'src/auth/guards/github.guard';
import { RegisterInput } from './dto/register.dto';
import { JwtAuthGuard } from './guards';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async registerUser(
    @Body() registerInput: RegisterInput
  ) {
    return await this.authService.registerUser(registerInput);
  }

  @Post('login')
  async login(@Body() loginInput: LoginDto) {
    return this.authService.login(loginInput);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  getHello(@Res() res: Response) { }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  getGoogleCallback(@Req() req: Request, @Res() res: Response) {
    req.user;
  }

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  getGitHub(@Res() res: Response) { }

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  getGitHubCallback(@Req() req: Request, @Res() res: Response) {
    req.user;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  refreshAuth(@Req() req: Request, @Res() res: Response) {

  }
}
