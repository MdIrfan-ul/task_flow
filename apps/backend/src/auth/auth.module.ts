import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GitHubStrategy, GoogleStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GitHubStrategy, JwtStrategy],
})
export class AuthModule { }
