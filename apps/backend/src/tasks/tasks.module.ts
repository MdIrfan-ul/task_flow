import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './entities/comment.entity';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Comment,
      Task
    ])
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule { }
