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

  async updateProfile(id: number, filePath: string) {
    const user = await this.userRepo.findByPk(id);

    if (!user) {
      // clean up the file we just saved, since we can't attach it to anyone
      removeFile(join(process.cwd(), 'images', filePath));
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    const oldPath = user.profile; // adjust field name to your schema

    user.profile = filePath;
    await user.save();

    // remove the old image only after the new one is successfully saved
    if (oldPath) {
      removeFile(join(process.cwd(), 'images', oldPath));
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
