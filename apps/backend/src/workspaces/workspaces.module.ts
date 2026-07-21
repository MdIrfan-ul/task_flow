import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { Project } from 'src/projects/entities/project.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Workspace,
      WorkspaceMember,
      Project
    ])
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
})
export class WorkspacesModule { }
