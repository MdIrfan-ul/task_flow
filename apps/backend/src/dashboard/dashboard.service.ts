import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Task, TaskStatus } from 'src/tasks/entities/task.entity';
import { Comment } from 'src/tasks/entities/comment.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(WorkspaceMember) private readonly memberRepo: typeof WorkspaceMember,
        @InjectModel(Project) private readonly projectRepo: typeof Project,
        @InjectModel(Task) private readonly taskRepo: typeof Task,
        @InjectModel(Comment) private readonly commentRepo: typeof Comment,
        @InjectModel(User) private readonly userRepo: typeof User,
    ) { }

    async getStats(userId: number) {
        // Get all workspace IDs this user belongs to
        const memberships = await this.memberRepo.findAll({
            where: { user_id: userId },
            attributes: ['workspace_id'],
        });
        const workspaceIds = memberships.map((m) => m.workspace_id);

        if (workspaceIds.length === 0) {
            return {
                totalProjects: 0,
                activeTasks: 0,
                completedTasks: 0,
                teamMembers: 0,
                projectsGrowth: 0,
                completionRate: 0,
                onlineMembers: 0,
            };
        }

        // Get all project IDs in those workspaces
        const projects = await this.projectRepo.findAll({
            where: { workspace_id: { [Op.in]: workspaceIds } },
            attributes: ['id'],
        });
        const projectIds = projects.map((p) => p.id);

        // Run all counts in parallel
        const [
            totalProjects,
            activeTasks,
            completedTasks,
            teamMembersRaw,
            recentProjects,
        ] = await Promise.all([
            // Total projects
            this.projectRepo.count({
                where: { workspace_id: { [Op.in]: workspaceIds } },
            }),

            // Active tasks (todo + in_progress)
            projectIds.length > 0
                ? this.taskRepo.count({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        status: { [Op.in]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
                    },
                })
                : Promise.resolve(0),

            // Completed tasks
            projectIds.length > 0
                ? this.taskRepo.count({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        status: TaskStatus.DONE,
                    },
                })
                : Promise.resolve(0),

            // Unique team members across all workspaces
            this.memberRepo.count({
                where: { workspace_id: { [Op.in]: workspaceIds } },
                distinct: true,
                col: 'user_id',
            }),

            // Projects created in last 30 days (for growth badge)
            this.projectRepo.count({
                where: {
                    workspace_id: { [Op.in]: workspaceIds },
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        const totalTasks = activeTasks + completedTasks;
        const completionRate =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalProjects,
            activeTasks,
            completedTasks,
            teamMembers: teamMembersRaw,
            projectsGrowth: recentProjects,
            completionRate,
            onlineMembers: 0, // Real-time tracking needs WebSockets — placeholder for now
        };
    }

    async getActivity(userId: number) {
        // Get workspace IDs
        const memberships = await this.memberRepo.findAll({
            where: { user_id: userId },
            attributes: ['workspace_id'],
        });
        const workspaceIds = memberships.map((m) => m.workspace_id);
        if (workspaceIds.length === 0) return [];

        // Get project IDs
        const projects = await this.projectRepo.findAll({
            where: { workspace_id: { [Op.in]: workspaceIds } },
            attributes: ['id'],
        });
        const projectIds = projects.map((p) => p.id);
        if (projectIds.length === 0) return [];

        // Recent completed tasks
        const completedTasks = await this.taskRepo.findAll({
            where: {
                project_id: { [Op.in]: projectIds },
                status: TaskStatus.DONE,
                updated_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'profile'] },
                { model: Project, attributes: ['id', 'name'] },
            ],
            order: [['updated_at', 'DESC']],
            limit: 5,
        });

        // Recent comments
        const recentComments = await this.commentRepo.findAll({
            where: {
                task_id: {
                    [Op.in]: await this.taskRepo
                        .findAll({ where: { project_id: { [Op.in]: projectIds } }, attributes: ['id'] })
                        .then((tasks) => tasks.map((t) => t.id)),
                },
                created_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            include: [
                { model: User, as: 'author', attributes: ['id', 'name', 'profile'] },
                {
                    model: Task,
                    attributes: ['id', 'title'],
                },
            ],
            order: [['created_at', 'DESC']],
            limit: 5,
        });

        // Recent member joins
        const recentMembers = await this.memberRepo.findAll({
            where: {
                workspace_id: { [Op.in]: workspaceIds },
                created_at: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            include: [
                { model: User, attributes: ['id', 'name', 'profile'] },
                { model: Workspace, attributes: ['id', 'name'] },
            ],
            order: [['created_at', 'DESC']],
            limit: 3,
        });

        // Format and merge all activities
        const activities = [
            ...completedTasks.map((t) => ({
                id: `task-${t.id}`,
                type: 'task_completed' as const,
                actorName: t.creator?.name ?? 'Someone',
                actorAvatar: t.creator?.profile ?? null,
                subject: t.title,
                context: t.project?.name ?? '',
                createdAt: t.updated_at.toISOString(),
            })),
            ...recentComments.map((c) => ({
                id: `comment-${c.id}`,
                type: 'comment_added' as const,
                actorName: c.author?.name ?? 'Someone',
                actorAvatar: c.author?.profile ?? null,
                subject: c.task?.title ?? 'a task',
                context: c.content.slice(0, 80) + (c.content.length > 80 ? '...' : ''),
                createdAt: c.created_at.toISOString(),
            })),
            ...recentMembers.map((m) => ({
                id: `member-${m.id}`,
                type: 'member_joined' as const,
                actorName: m.user?.name ?? 'Someone',
                actorAvatar: m.user?.profile ?? null,
                subject: m.workspace?.name ?? 'a workspace',
                context: '',
                createdAt: m.created_at.toISOString(),
            })),
        ];

        // Sort by most recent
        return activities
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
    }

    async getProjectProgress(userId: number) {
        const memberships = await this.memberRepo.findAll({
            where: { user_id: userId },
            attributes: ['workspace_id'],
        });

        const workspaceIds = memberships.map((m) => m.workspace_id);

        if (!workspaceIds.length) return [];

        const projects = await this.projectRepo.findAll({
            where: {
                workspace_id: {
                    [Op.in]: workspaceIds,
                },
            },
            attributes: ['id', 'name'],
        });

        if (!projects.length) return [];

        const result = await Promise.all(
            projects.map(async (project) => {
                const totalTasks = await this.taskRepo.count({
                    where: {
                        project_id: project.id,
                    },
                });

                const completedTasks = await this.taskRepo.count({
                    where: {
                        project_id: project.id,
                        status: TaskStatus.DONE,
                    },
                });

                return {
                    name: project.name,
                    progress:
                        totalTasks === 0
                            ? 0
                            : Math.round((completedTasks / totalTasks) * 100),
                    planned: 100,
                };
            }),
        );

        return result;
    }

    async getTaskCompletionTrend(userId: number) {
        // Get user's workspaces
        const memberships = await this.memberRepo.findAll({
            where: { user_id: userId },
            attributes: ["workspace_id"],
        });

        const workspaceIds = memberships.map((m) => m.workspace_id);

        if (!workspaceIds.length) return [];

        const projects = await this.projectRepo.findAll({
            where: {
                workspace_id: {
                    [Op.in]: workspaceIds,
                },
            },
            attributes: ["id"],
        });

        const projectIds = projects.map((p) => p.id);

        if (!projectIds.length) return [];

        const data: Array<{ date: string; completed: number }> = [];

        for (let i = 13; i >= 0; i--) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            start.setDate(start.getDate() - i);

            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            const completed = await this.taskRepo.count({
                where: {
                    project_id: {
                        [Op.in]: projectIds,
                    },
                    status: TaskStatus.DONE,
                    updated_at: {
                        [Op.between]: [start, end],
                    },
                },
            });

            data.push({
                date: start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                completed,
            });
        }

        return data;
    }
}