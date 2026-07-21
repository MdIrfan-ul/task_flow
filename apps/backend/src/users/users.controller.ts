import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { removeFile, storage } from 'src/utils/image-storage.util';
import { join } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id/profile')
  @UseInterceptors(FileInterceptor('file', storage('images/profile')))
  async uploadProfile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: { name?: string; email?: string },
  ) {
    const updatePayload = {
      profile: file ? `images/profile/${file.filename}` : undefined,
      name: body?.name,
      email: body?.email,
    };

    try {
      const user = await this.usersService.updateProfile(id, updatePayload);

      return {
        message: 'Profile updated successfully.',
        user,
      };
    } catch (error) {
      // Remove newly uploaded file if DB update fails
      if (file) {
        removeFile(join(process.cwd(), 'images/profile', file.filename));
      }
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
