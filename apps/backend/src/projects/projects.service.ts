import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from './entities/project.entity';
import { WorkspaceMember } from 'src/workspaces/entities/workspace-member.entity';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project) private readonly projectRepo: typeof Project,
        @InjectModel(WorkspaceMember) private readonly memberRepo: typeof WorkspaceMember,
    ) { }

    private async requireMember(workspaceId: number, userId: number) {
        const m = await this.memberRepo.findOne({
            where: { workspace_id: workspaceId, user_id: userId },
        });
        if (!m) throw new ForbiddenException('Access denied');
        return m;
    }

    async create(
        workspaceId: number,
        userId: number,
        name: string,
        description?: string,
    ) {
        await this.requireMember(workspaceId, userId);

        return this.projectRepo.create({
            name,
            description,
            workspace_id: workspaceId,
            created_by: userId,
        });
    }

    async findAll(workspaceId: number, userId: number) {
        await this.requireMember(workspaceId, userId);

        return this.projectRepo.findAll({
            where: { workspace_id: workspaceId },
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async findOne(projectId: number, userId: number) {
        const project = await this.projectRepo.findByPk(projectId, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
            ],
        });
        if (!project) throw new NotFoundException('Project not found');

        await this.requireMember(project.workspace_id, userId);
        return project;
    }

    async update(
        projectId: number,
        userId: number,
        data: { name?: string; description?: string },
    ) {
        const project = await this.findOne(projectId, userId);
        await project.update(data);
        return project;
    }

    async delete(projectId: number, userId: number) {
        const project = await this.findOne(projectId, userId);

        const member = await this.memberRepo.findOne({
            where: { workspace_id: project.workspace_id, user_id: userId },
        });

        if (!['owner', 'admin'].includes(member!.role)) {
            throw new ForbiddenException('Admin or owner access required');
        }

        await project.destroy();
        return { message: 'Project deleted' };
    }
}