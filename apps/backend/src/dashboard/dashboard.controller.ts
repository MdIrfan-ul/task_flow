import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  // GET /dashboard/stats
  @Get('stats')
  getStats(@Req() req: AuthRequest) {
    return this.dashboardService.getStats(req.user.userId);
  }

  // GET /dashboard/activity
  @Get('activity')
  getActivity(@Req() req: AuthRequest) {
    return this.dashboardService.getActivity(req.user.userId);
  }

  @Get('project-progress')
  getProjectProgress(@Req() req: AuthRequest) {
    return this.dashboardService.getProjectProgress(req.user.userId);
  }
}