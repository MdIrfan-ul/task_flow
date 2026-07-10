import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterInput } from './dto/register.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { WhereOptions } from 'sequelize';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private readonly userRepo: typeof User
    ) { }
    async registerUser(registerInput: RegisterInput) {
        const { email, password, name } = registerInput;
        const user = await this.userRepo.create({ name, email, password });
        return user;
    }

    private async checkExistUser(where: WhereOptions<User>): Promise<boolean> {
        const user = await this.userRepo.findOne({ where })
        return !!user
    }

    async login(loginInput: LoginDto) {
        const { email, password } = loginInput;

        const user = await this.checkExistUser({ email });


    }

}
