import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GitHubStrategy, GoogleStrategy, JwtStrategy } from './strategies';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LoginSessions } from './entities/login_sessions.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User, LoginSessions])
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GitHubStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule { }
