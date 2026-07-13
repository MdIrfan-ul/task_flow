import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Project, WorkspaceMember])
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService, SequelizeModule]
})
export class ProjectsModule { }
