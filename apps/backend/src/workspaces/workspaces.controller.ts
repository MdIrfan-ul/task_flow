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
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { Request } from 'express';
import { WorkspaceRole } from './entities/workspace-member.entity';
import { UserType } from 'src/users/enums/user-enum';
import { Roles } from 'src/common/decorators/roles.decorator';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  // POST /workspaces

  @Roles(UserType.OWNER)
  @Post()
  create(@Req() req: AuthRequest, @Body('name') name: string) {
    return this.workspacesService.create(req.user.userId, name);
  }

  // GET /workspaces/mine
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('mine')
  findMine(@Req() req: AuthRequest) {
    return this.workspacesService.findAllByUser(req.user.userId);
  }

  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get('stats')
  workspaceStats(
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.getWorkspaceStats(req.user.userId);
  }

  // GET /workspaces/:id
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.findOne(id, req.user.userId);
  }

  // DELETE /workspaces/:id
  @Roles(UserType.OWNER)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.delete(id, req.user.userId);
  }

  // GET /workspaces/:id/members
  @Roles(UserType.OWNER, UserType.MEMBER)
  @Get(':id/members')
  getMembers(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.getMembers(id, req.user.userId);
  }



  // POST /workspaces/:id/invite
  @Roles(UserType.OWNER)
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
  @Roles(UserType.OWNER)
  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: AuthRequest,
  ) {
    return this.workspacesService.removeMember(id, req.user.userId, memberId);
  }

  // PATCH /workspaces/:id/members/:memberId
  @Roles(UserType.OWNER)
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