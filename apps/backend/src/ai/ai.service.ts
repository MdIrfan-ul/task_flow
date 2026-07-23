import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import OpenAI from 'openai';
import { Task, TaskPriority, TaskStatus } from 'src/tasks/entities/task.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { buildTaskPrompt, TASK_SYSTEM_PROMPT } from './prompts';
import { buildProjectSummaryPrompt, PROJECT_SUMMARY_SYSTEM_PROMPT } from './prompts/summarize-workspace.prompt';
import { buildAIInsightsPrompt } from './prompts/ai-insights.prompt';
import { Op } from 'sequelize';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';

export interface GeneratedTask {
    title: string;
    description: string;
    priority: TaskPriority;
    due_date: string;
}

@Injectable()
export class AiService {
    private readonly openai: OpenAI;
    private readonly MODEL_NAME = 'llama-3.3-70b-versatile';

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(Task) private readonly taskRepo: typeof Task,
        @InjectModel(Project) private readonly projectRepo: typeof Project,
        @InjectModel(WorkspaceMember) private readonly memberRepo: typeof WorkspaceMember,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('GROQ_API_KEY'),
            baseURL: "https://api.groq.com/openai/v1",
        });
    }

    // ─── Generate tasks from a goal ──────────────────────────────────────

    async generateTasks(goal: string): Promise<{ tasks: GeneratedTask[] }> {
        try {
            const today = new Date().toISOString().split("T")[0];
            const response = await this.openai.chat.completions.create({
                model: this.MODEL_NAME,
                max_tokens: 1000,
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: TASK_SYSTEM_PROMPT,
                    },
                    {
                        role: "user",
                        content: buildTaskPrompt(goal, today),
                    },
                ],
            });

            const content = response.choices[0]?.message?.content?.trim();

            if (!content) {
                throw new Error("No content from AI");
            }
            const cleaned = content
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/```$/, "")
                .trim();

            const parsed = JSON.parse(cleaned);

            if (!Array.isArray(parsed.tasks)) {
                throw new Error("Invalid response structure");
            }

            const tasks: GeneratedTask[] = parsed.tasks
                .filter((t: any) => t.title && t.description)
                .map((t: any) => ({
                    title: String(t.title).slice(0, 120),
                    description: String(t.description).slice(0, 500),
                    priority: ["high", "medium", "low"].includes(t.priority)
                        ? t.priority
                        : TaskPriority.MEDIUM,
                    due_date: t.due_date
                }));

            return { tasks };
        } catch (error) {
            console.error(error);

            if (error instanceof SyntaxError) {
                throw new InternalServerErrorException(
                    "AI returned invalid JSON. Please try again."
                );
            }

            throw new InternalServerErrorException(
                "Failed to generate tasks. Please try again."
            );
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
                model: this.MODEL_NAME,
                max_tokens: 800,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: PROJECT_SUMMARY_SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: buildProjectSummaryPrompt(project.name, taskList, taskList?.length),
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
    async generateDashboardInsights(userId: number) {
        // Get workspace ids
        const memberships = await this.memberRepo.findAll({
            where: { user_id: userId },
            attributes: ["workspace_id"],
        });

        const workspaceIds = memberships.map((m) => m.workspace_id);

        const projects = await this.projectRepo.findAll({
            where: {
                workspace_id: {
                    [Op.in]: workspaceIds,
                },
            },
        });

        const projectIds = projects.map((p) => p.id);

        const tasks = await this.taskRepo.findAll({
            where: {
                project_id: {
                    [Op.in]: projectIds,
                },
            },
            include: [
                {
                    model: User,
                    as: "assignee",
                    attributes: ["name"],
                },
                {
                    model: Project,
                    attributes: ["name"],
                },
            ],
        });

        const response = await this.openai.chat.completions.create({
            model: this.MODEL_NAME,
            temperature: 0.2,
            response_format: {
                type: "json_object",
            },
            messages: [
                {
                    role: "system",
                    content: "You are a senior engineering manager.",
                },
                {
                    role: "user",
                    content: buildAIInsightsPrompt({ projects, tasks }),
                },
            ],
        });

        return JSON.parse(response.choices[0].message.content!);
    }
}