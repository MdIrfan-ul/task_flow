import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { Request } from 'express';
import { UserType } from 'src/users/enums/user-enum';
import { Roles } from 'src/common/decorators/roles.decorator';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  // POST /workspaces/:workspaceId/projects
  @Roles(UserType.OWNER)
  @Post('workspaces/:workspaceId/projects')
  create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: AuthRequest,
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.projectsService.create(
      workspaceId,
      req.user.userId,
      name,
      description,
    );
  }

  // GET /workspaces/:workspaceId/projects
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('workspaces/:workspaceId/projects')
  findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: AuthRequest,
  ) {
    return this.projectsService.findAll(workspaceId, req.user.userId);
  }

  // GET /projects/:id
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('projects/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  // PATCH /projects/:id
  @Roles(UserType.OWNER)
  @Patch('projects/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.projectsService.update(id, req.user.userId, body);
  }

  // DELETE /projects/:id
  @Roles(UserType.OWNER)
  @Delete('projects/:id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.projectsService.delete(id, req.user.userId);
  }
}