import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GitHubAuthGuard } from 'src/guards/github.guard';
import { GoogleAuthGuard } from 'src/guards/google.guard';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { GitHubStrategy } from 'src/strategies/github.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GitHubStrategy, GoogleAuthGuard, GitHubAuthGuard],
})
export class AuthModule { }
