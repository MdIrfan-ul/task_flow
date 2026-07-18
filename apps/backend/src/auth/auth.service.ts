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

export interface TokenPayload {
    userId: number,
    email: string,
    role: string
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private readonly userRepo: typeof User,
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
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.user_type,
                avatarUrl: user.profile ?? null,
            }
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

}
