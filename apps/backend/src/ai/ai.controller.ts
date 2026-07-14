import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AiService, type GeneratedTask } from './ai.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number; email: string; role: string };
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) { }

  // POST /ai/generate-tasks
  @Post('generate-tasks')
  generateTasks(
    @Body('goal') goal: string,
  ): Promise<{ tasks: GeneratedTask[] }> {
    return this.aiService.generateTasks(goal);
  }

  // POST /ai/generate-tasks/save
  @Post('generate-tasks/save')
  saveTasks(
    @Req() req: AuthRequest,
    @Body('projectId') projectId: number,
    @Body('tasks') tasks: { title: string; description: string; priority: string }[],
  ) {
    return this.aiService.saveTasks(projectId, req.user.userId, tasks as any);
  }

  // POST /ai/summarize
  @Post('summarize')
  summarize(@Body('projectId') projectId: number) {
    return this.aiService.summarizeProject(projectId);
  }
}