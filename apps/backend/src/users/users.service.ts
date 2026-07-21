import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { removeFile } from 'src/utils/image-storage.util';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User
  ) {

  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async updateProfile(
    id: number,
    updatePayload: {
      profile?: string;
      name?: string;
      email?: string;
    },
  ) {
    const user = await this.userRepo.findByPk(id);

    if (!user) {
      if (updatePayload.profile) {
        removeFile(join(process.cwd(), updatePayload.profile));
      }

      throw new NotFoundException(`User with id ${id} not found.`);
    }

    const oldProfile = user.profile;

    if (updatePayload.profile !== undefined) {
      user.profile = updatePayload.profile;
    }

    if (updatePayload.name !== undefined) {
      user.name = updatePayload.name;
    }

    if (updatePayload.email !== undefined) {
      user.email = updatePayload.email;
    }

    await user.save();

    // Delete old image only if a new one was uploaded
    if (
      updatePayload.profile &&
      oldProfile &&
      oldProfile !== updatePayload.profile
    ) {
      removeFile(join(process.cwd(), oldProfile));
    }

    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
