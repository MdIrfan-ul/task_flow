import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task) private taskRepo: typeof Task,
        @InjectModel(Comment) private commentRepo: typeof Comment,
        @InjectModel(Project) private projectRepo: typeof Project,
        @InjectModel(WorkspaceMember) private memberRepo: typeof WorkspaceMember,
    ) { }

    private async requireProjectAccess(projectId: number, userId: number) {
        const project = await this.projectRepo.findByPk(projectId);
        if (!project) throw new NotFoundException('Project not found');

        const member = await this.memberRepo.findOne({
            where: { workspace_id: project.workspace_id, user_id: userId },
        });
        if (!member) throw new ForbiddenException('Access denied');
        return project;
    }

    private formatTask(task: Task, commentCount = 0) {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            order: task.order,
            dueDate: task.due_date,
            projectId: task.project_id,
            commentCount,
            assignee: task.assignee
                ? {
                    id: task.assignee.id,
                    name: task.assignee.name,
                    avatarUrl: task.assignee.profile ?? null,
                }
                : null,
        };
    }

    async findAllByProject(projectId: number, userId: number) {
        await this.requireProjectAccess(projectId, userId);

        const tasks = await this.taskRepo.findAll({
            where: { project_id: projectId },
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'name', 'profile'] },
                { model: Comment, attributes: ['id'] },
            ],
            order: [['order', 'ASC']],
        });

        return tasks.map((t) => this.formatTask(t, t.comments?.length ?? 0));
    }

    async findOne(taskId: number, userId: number) {
        const task = await this.taskRepo.findByPk(taskId, {
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'name', 'profile'] },
                { model: Comment, attributes: ['id'] },
            ],
        });
        if (!task) throw new NotFoundException('Task not found');

        await this.requireProjectAccess(task.project_id, userId);
        return this.formatTask(task, task.comments?.length ?? 0);
    }

    async create(
        projectId: number,
        userId: number,
        data: {
            title: string;
            description?: string;
            status?: TaskStatus;
            priority?: TaskPriority;
            assigneeId?: number;
            dueDate?: string;
        },
    ) {
        await this.requireProjectAccess(projectId, userId);

        const task = await this.taskRepo.create({
            title: data.title,
            description: data.description,
            status: data.status ?? TaskStatus.TODO,
            priority: data.priority ?? TaskPriority.MEDIUM,
            assignee_id: data.assigneeId ?? null,
            due_date: data.dueDate ?? null,
            project_id: projectId,
            created_by: userId,
        });

        return this.formatTask(task);
    }

    async update(
        taskId: number,
        userId: number,
        data: {
            title?: string;
            description?: string;
            priority?: TaskPriority;
            assigneeId?: number | null;
            dueDate?: string | null;
        },
    ) {
        const task = await this.taskRepo.findByPk(taskId, {
            include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'profile'] }],
        });
        if (!task) throw new NotFoundException('Task not found');
        await this.requireProjectAccess(task.project_id, userId);

        await task.update({
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.assigneeId !== undefined && { assignee_id: data.assigneeId }),
            ...(data.dueDate !== undefined && { due_date: data.dueDate }),
        });

        await task.reload({
            include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'profile'] }],
        });

        return this.formatTask(task);
    }

    async updateStatus(taskId: number, userId: number, status: TaskStatus) {
        const task = await this.taskRepo.findByPk(taskId);
        if (!task) throw new NotFoundException('Task not found');
        await this.requireProjectAccess(task.project_id, userId);

        await task.update({ status });
        return this.formatTask(task);
    }

    async delete(taskId: number, userId: number) {
        const task = await this.taskRepo.findByPk(taskId);
        if (!task) throw new NotFoundException('Task not found');
        await this.requireProjectAccess(task.project_id, userId);

        await task.destroy();
        return { message: 'Task deleted' };
    }

    // ─── Comments ─────────────────────────────────────────────────────────

    async getComments(taskId: number, userId: number) {
        const task = await this.taskRepo.findByPk(taskId);
        if (!task) throw new NotFoundException('Task not found');
        await this.requireProjectAccess(task.project_id, userId);

        const comments = await this.commentRepo.findAll({
            where: { task_id: taskId },
            include: [
                { model: User, as: 'author', attributes: ['id', 'name', 'profile'] },
            ],
            order: [['created_at', 'ASC']],
        });

        return comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.created_at,
            author: {
                id: c.author.id,
                name: c.author.name,
                avatarUrl: c.author.profile ?? null,
            },
        }));
    }

    async addComment(taskId: number, userId: number, content: string) {
        const task = await this.taskRepo.findByPk(taskId);
        if (!task) throw new NotFoundException('Task not found');
        await this.requireProjectAccess(task.project_id, userId);

        const comment = await this.commentRepo.create({
            content,
            task_id: taskId,
            user_id: userId,
        });

        await comment.reload({
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'profile'] }],
        });

        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.created_at,
            author: {
                id: comment.author.id,
                name: comment.author.name,
                avatarUrl: comment.author.profile ?? null,
            },
        };
    }
}