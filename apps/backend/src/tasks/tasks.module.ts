import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './entities/comment.entity';
import { Task } from './entities/task.entity';
import { Project } from 'src/projects/entities/project.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';

@Module({
  imports: [SequelizeModule.forFeature([Task, Comment, Project, WorkspaceMember])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService, SequelizeModule],
})
export class TasksModule { }
