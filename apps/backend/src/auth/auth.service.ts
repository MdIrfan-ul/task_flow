import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterInput } from './dto/register.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { WhereOptions } from 'sequelize';
import { comparePassword } from 'src/utils/password.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserType } from 'src/users/enums/user-enum';
import { LoginSessions } from './entities/login_sessions.entity';
import { DeviceInfo } from 'src/utils/device-util';
import ms from 'ms';

export interface TokenPayload {
    userId: string,
    email: string,
    role: string
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private readonly userRepo: typeof User,
        @InjectModel(LoginSessions) private readonly loginSessionRepo: typeof LoginSessions,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { }
    async registerUser(registerInput: RegisterInput) {
        const { email, password, name } = registerInput;
        const user = await this.userRepo.create({ name, email, password, user_type: UserType.OWNER });
        return user;
    }

    private async checkExistUser(where: WhereOptions<User>): Promise<User | null> {
        const user = await this.userRepo.findOne({ where, raw: true })
        return user;
    }

    async generateTokens(tokenPayload: TokenPayload): Promise<{ accessToken: string, refreshToken: string }> {
        const accessTime = this.configService.get<number>('ACCESS_TOKEN');
        const accessSecret = this.configService.get<string>('JWT_SECRET_KEY')
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET_KEY')
        const refreshTime = this.configService.get<number>('REFRESH_TOKEN');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(tokenPayload, {
                secret: accessSecret,
                expiresIn: accessTime
            }),
            this.jwtService.signAsync(tokenPayload, {
                secret: refreshSecret,
                expiresIn: refreshTime
            })
        ]);
        return { accessToken, refreshToken }
    }

    private toPublicUser(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.user_type,
            avatarUrl: user.profile ?? null,
        };
    }
    private getRefreshExpiryDate(): Date {
        const raw = this.configService.get<string | number>('REFRESH_TOKEN');
        let durationMs: number;

        if (typeof raw === 'number') {
            durationMs = raw * 1000; // plain seconds, per jsonwebtoken's convention
        } else if (typeof raw === 'string' && raw.trim() !== '') {
            const parsed = /^\d+$/.test(raw.trim()) ? Number(raw.trim()) * 1000 : ms(raw as ms.StringValue);
            durationMs = typeof parsed === 'number' && !Number.isNaN(parsed) ? parsed : 0;
        } else {
            durationMs = 0;
        }

        return new Date(Date.now() + durationMs);
    }

    async createLoginSession(userId: number, refreshToken: string, deviceInfo: DeviceInfo) {
        return this.loginSessionRepo.create({
            user_id: userId,
            refresh_token: refreshToken,
            device_name: deviceInfo.device_name,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ip_address: deviceInfo.ip_address,
            user_agent: deviceInfo.user_agent,
            last_active_at: new Date().toLocaleString(),
            expires_at: this.getRefreshExpiryDate(),
        });
    }

    async rotateSession(oldRefreshToken: string | undefined, newRefreshToken: string, deviceInfo: DeviceInfo) {
        if (!oldRefreshToken) return;

        const session = await this.loginSessionRepo.findOne({ where: { refresh_token: oldRefreshToken } });
        if (!session) return;

        await session.update({
            refresh_token: newRefreshToken,
            ip_address: deviceInfo.ip_address,
            user_agent: deviceInfo.user_agent,
            device_name: deviceInfo.device_name,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            last_active_at: new Date(),
            expires_at: this.getRefreshExpiryDate(),
        });
    }

    async endSession(refreshToken: string | undefined) {
        if (!refreshToken) return;
        await this.loginSessionRepo.destroy({ where: { refresh_token: refreshToken } });
    }

    async getPublicUserById(userId: number) {
        const user = await this.userRepo.findByPk(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.toPublicUser(user);
    }

    async login(loginInput: LoginDto) {
        const { email, password } = loginInput;

        const user = await this.checkExistUser({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const checkPassword = await comparePassword(password, user?.password);
        if (!checkPassword) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const tokens = await this.generateTokens({ userId: user?.id, email: user?.email, role: user?.user_type });

        return {
            ...tokens,
            user: this.toPublicUser(user as unknown as User),
        }

    }


    async createMember(
        email: string, name: string,
        userId: number,
    ) {

        const checkOwner = await this.checkExistUser({ id: userId });
        if (!checkOwner) {
            throw new NotFoundException('owner not found.');
        }
        const checkUser = await this.checkExistUser({ email });
        if (checkUser) throw new ConflictException(`user found with email ${email}`);

        const create = await this.userRepo.create({
            name,
            email,
            password: 'Test@123',// for temporary,
            user_type: UserType.MEMBER
        });
        return create;

    }
    async findOrCreateOAuthUser(data: {
        email: string;
        name: string;
        picture?: string;
    }) {
        let user = await this.userRepo.findOne({
            where: { email: data.email },
        });


        user ??= await this.userRepo.create({
            email: data.email,
            name: data.name,
            profile: data.picture,
            password: null,
            user_type: UserType.OWNER,
        });

        return user;
    }

    // async logout(userId: number) {
    //     await this.userRepo.update()
    // }

}
