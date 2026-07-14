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
import { TasksService } from './tasks.service';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { Request } from 'express';
import { TaskPriority, TaskStatus } from './entities/task.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserType } from 'src/users/enums/user-enum';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  // GET /projects/:projectId/tasks
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('projects/:projectId/tasks')
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() req: AuthRequest,
  ) {
    return this.tasksService.findAllByProject(projectId, req.user.userId);
  }

  // GET /tasks/:id
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('tasks/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  // POST /projects/:projectId/tasks
  @Roles(UserType.OWNER)
  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() req: AuthRequest,
    @Body()
    body: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: number;
      dueDate?: string;
    },
  ) {
    console.log(body)
    return this.tasksService.create(projectId, req.user.userId, body);
  }

  // PATCH /tasks/:id
  @Roles(UserType.OWNER)
  @Patch('tasks/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
    @Body()
    body: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      assigneeId?: number | null;
      dueDate?: string | null;
    },
  ) {
    return this.tasksService.update(id, req.user.userId, body);
  }

  // PATCH /tasks/:id/status
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Patch('tasks/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, req.user.userId, status);
  }

  // DELETE /tasks/:id
  @Roles(UserType.OWNER)
  @Delete('tasks/:id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.tasksService.delete(id, req.user.userId);
  }

  // GET /tasks/:id/comments
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('tasks/:id/comments')
  getComments(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.tasksService.getComments(id, req.user.userId);
  }

  // POST /tasks/:id/comments
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Post('tasks/:id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
    @Body('content') content: string,
  ) {
    return this.tasksService.addComment(id, req.user.userId, content);
  }
}