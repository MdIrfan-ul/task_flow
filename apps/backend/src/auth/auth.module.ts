import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GitHubStrategy, GoogleStrategy, JwtStrategy } from './strategies';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User])
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GitHubStrategy, JwtStrategy],
})
export class AuthModule { }
