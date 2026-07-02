import { Injectable } from '@nestjs/common';
import { RegisterInput } from './dto/register.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private readonly userRepo: typeof User
    ) { }
    async registerUser(registerInput: RegisterInput) {

    }
}
