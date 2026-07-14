import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import OpenAI from 'openai';
import { Task, TaskPriority, TaskStatus } from 'src/tasks/entities/task.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export interface GeneratedTask {
    title: string;
    description: string;
    priority: TaskPriority;
}

@Injectable()
export class AiService {
    private readonly openai: OpenAI;

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(Task) private readonly taskRepo: typeof Task,
        @InjectModel(Project) private readonly projectRepo: typeof Project,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    // ─── Generate tasks from a goal ──────────────────────────────────────

    async generateTasks(goal: string): Promise<{ tasks: GeneratedTask[] }> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                max_tokens: 1000,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: `You are a project management assistant. Break down project goals into actionable developer tasks.
Always respond with valid JSON only. No markdown, no explanation outside the JSON.`,
                    },
                    {
                        role: 'user',
                        content: `Break down this project goal into 8-12 developer tasks:
"${goal}"

Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "title": "Short, actionable task title",
      "description": "1-2 sentence description of what needs to be done",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Rules:
- Tasks should be specific and actionable
- Mix of high, medium, and low priority tasks
- Order tasks logically (setup before implementation, implementation before testing)
- Each task should be completable in 1-2 days`,
                    },
                ],
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('No content from OpenAI');

            const parsed = JSON.parse(content);

            if (!Array.isArray(parsed.tasks)) {
                throw new Error('Invalid response structure from OpenAI');
            }

            // Validate and sanitize each task
            const tasks: GeneratedTask[] = parsed.tasks
                .filter((t: any) => t.title && t.description)
                .map((t: any) => ({
                    title: String(t.title).slice(0, 120),
                    description: String(t.description).slice(0, 500),
                    priority: ['high', 'medium', 'low'].includes(t.priority)
                        ? t.priority
                        : TaskPriority.MEDIUM,
                }));

            return { tasks };
        } catch (error) {
            console.log(error);
            if (error instanceof SyntaxError) {
                throw new InternalServerErrorException('AI returned invalid response. Please try again.');
            }
            throw new InternalServerErrorException('Failed to generate tasks. Please try again.');
        }
    }

    // ─── Save generated tasks to a project ───────────────────────────────

    async saveTasks(
        projectId: number,
        userId: number,
        tasks: GeneratedTask[],
    ): Promise<Task[]> {
        const created = await Promise.all(
            tasks.map((task, index) =>
                this.taskRepo.create({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: TaskStatus.TODO,
                    order: index,
                    project_id: projectId,
                    created_by: userId,
                }),
            ),
        );
        return created;
    }

    // ─── Summarize project progress ───────────────────────────────────────

    async summarizeProject(projectId: number) {
        const project = await this.projectRepo.findByPk(projectId);
        if (!project) throw new InternalServerErrorException('Project not found');

        const tasks = await this.taskRepo.findAll({
            where: { project_id: projectId },
            include: [{ model: User, as: 'assignee', attributes: ['name'] }],
        });

        const completedCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;
        const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
        const todoCount = tasks.filter((t) => t.status === TaskStatus.TODO).length;

        if (tasks.length === 0) {
            return {
                summary: 'No tasks have been created for this project yet.',
                completedCount: 0,
                inProgressCount: 0,
                todoCount: 0,
                highlights: [],
                blockers: [],
            };
        }

        const taskList = tasks
            .map(
                (t) =>
                    `- [${t.status.toUpperCase()}] ${t.title} (${t.priority} priority)${t.assignee ? ` — assigned to ${t.assignee.name}` : ''
                    }`,
            )
            .join('\n');

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                max_tokens: 800,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: 'You are a project management assistant. Summarize project progress concisely.',
                    },
                    {
                        role: 'user',
                        content: `Project: "${project.name}"
Tasks (${tasks.length} total):
${taskList}

Provide a progress summary as JSON:
{
  "summary": "2-3 sentence plain English summary of overall progress",
  "highlights": ["up to 3 positive achievements or completed milestones"],
  "blockers": ["up to 3 risks, blockers, or areas needing attention"]
}`,
                    },
                ],
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('No content from OpenAI');

            const parsed = JSON.parse(content);

            return {
                summary: parsed.summary ?? 'Project is in progress.',
                completedCount,
                inProgressCount,
                todoCount,
                highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 3) : [],
                blockers: Array.isArray(parsed.blockers) ? parsed.blockers.slice(0, 3) : [],
            };
        } catch {
            // Return basic stats even if AI fails
            return {
                summary: `Project has ${tasks.length} tasks: ${completedCount} completed, ${inProgressCount} in progress, ${todoCount} to do.`,
                completedCount,
                inProgressCount,
                todoCount,
                highlights: [],
                blockers: [],
            };
        }
    }
}