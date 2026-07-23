import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Task } from 'src/tasks/entities/task.entity';
import { Project } from 'src/projects/entities/project.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';

@Module({
  imports: [SequelizeModule.forFeature([Task, Project, WorkspaceMember])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule { }
