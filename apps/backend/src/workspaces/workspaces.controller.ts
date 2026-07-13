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
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { Request } from 'express';
import { WorkspaceRole } from './entities/workspace-member.entity';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  // POST /workspaces
  @Post()
  create(@Req() req: AuthRequest, @Body('name') name: string) {
    return this.workspacesService.create(req.user.userId, name);
  }

  // GET /workspaces/mine
  @Get('mine')
  findMine(@Req() req: AuthRequest) {
    return this.workspacesService.findAllByUser(req.user.userId);
  }

  // GET /workspaces/:id
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.findOne(id, req.user.userId);
  }

  // DELETE /workspaces/:id
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.delete(id, req.user.userId);
  }

  // GET /workspaces/:id/members
  @Get(':id/members')
  getMembers(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.getMembers(id, req.user.userId);
  }

  // POST /workspaces/:id/invite
  @Post(':id/invite')
  inviteMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
    @Body('email') email: string,
    @Body('role') role: WorkspaceRole = WorkspaceRole.MEMBER,
  ) {
    return this.workspacesService.inviteMember(
      id,
      req.user.userId,
      email,
      role,
    );
  }

  // DELETE /workspaces/:id/members/:memberId
  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.removeMember(id, req.user.userId, memberId);
  }

  // PATCH /workspaces/:id/members/:memberId
  @Patch(':id/members/:memberId')
  updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: AuthRequest,
    @Body('role') role: WorkspaceRole,
  ) {
    return this.workspacesService.updateMemberRole(
      id,
      req.user.userId,
      memberId,
      role,
    );
  }
}