import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceRole } from './entities/workspace-member.entity';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectModel(Workspace) private readonly workspaceRepo: typeof Workspace,
        @InjectModel(WorkspaceMember) private readonly memberRepo: typeof WorkspaceMember,
        @InjectModel(Project) private readonly projectRepo: typeof Project,
    ) { }

    async create(userId: number, name: string) {
        const workspace = await this.workspaceRepo.create({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            owner_id: userId,
        });

        // Add creator as owner member
        await this.memberRepo.create({
            workspace_id: workspace.id,
            user_id: userId,
            role: WorkspaceRole.OWNER,
        });

        return workspace;
    }

    async findAllByUser(userId: number) {
        const memberships = await this.memberRepo.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Workspace,
                    include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
                },
            ],
        });

        return memberships.map((m) => ({
            ...m.workspace.toJSON(),
            myRole: m.role,
        }));
    }

    async findOne(workspaceId: number, userId: number) {
        const workspace = await this.workspaceRepo.findByPk(workspaceId, {
            include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
        });
        if (!workspace) throw new NotFoundException('Workspace not found');

        const membership = await this.memberRepo.findOne({
            where: { workspace_id: workspaceId, user_id: userId },
        });
        if (!membership) throw new ForbiddenException('Access denied');

        return { ...workspace.toJSON(), myRole: membership.role };
    }

    async getMembers(workspaceId: number, userId: number) {
        await this.findOne(workspaceId, userId);

        const members = await this.memberRepo.findAll({
            where: { workspace_id: workspaceId },
            include: [{ model: User, attributes: ['id', 'name', 'email', 'profile'] }],
        });

        return members.map((m) => ({
            id: m.id,
            userId: m.user_id,
            name: m.user.name,
            email: m.user.email,
            avatarUrl: m.user.profile ?? null,
            role: m.role,
            joinedAt: m.created_at,
        }));
    }

    async inviteMember(workspaceId: number, requesterId: number, email: string, role: WorkspaceRole) {
        await this.requireAdminOrOwner(workspaceId, requesterId);

        const user = await User.findOne({ where: { email } });
        if (!user) throw new NotFoundException(`No user found with email ${email}`);

        const existing = await this.memberRepo.findOne({
            where: { workspace_id: workspaceId, user_id: user.id },
        });
        if (existing) throw new ForbiddenException('User is already a member');

        const member = await this.memberRepo.create({
            workspace_id: workspaceId,
            user_id: user.id,
            role,
        });

        return {
            id: member.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            role: member.role,
            joinedAt: member.created_at,
        };
    }

    async removeMember(workspaceId: number, requesterId: number, memberId: number) {
        await this.requireAdminOrOwner(workspaceId, requesterId);

        const member = await this.memberRepo.findOne({
            where: { workspace_id: workspaceId, user_id: memberId },
        });
        if (!member) throw new NotFoundException('Member not found');
        if (member.role === WorkspaceRole.OWNER)
            throw new ForbiddenException('Cannot remove workspace owner');

        await member.destroy();
        return { message: 'Member removed' };
    }

    async updateMemberRole(workspaceId: number, requesterId: number, memberId: number, role: WorkspaceRole) {
        await this.requireOwner(workspaceId, requesterId);

        const member = await this.memberRepo.findOne({
            where: { workspace_id: workspaceId, user_id: memberId },
        });
        if (!member) throw new NotFoundException('Member not found');

        await member.update({ role });
        return member;
    }

    async delete(workspaceId: number, userId: number) {
        await this.requireOwner(workspaceId, userId);
        const workspace = await this.workspaceRepo.findByPk(workspaceId);
        if (!workspace) throw new NotFoundException('Workspace not found');
        await workspace.destroy();
        return { message: 'Workspace deleted' };
    }

    // ─── Role helpers ────────────────────────────────────────────────────

    async getMembership(workspaceId: number, userId: number) {
        const m = await this.memberRepo.findOne({
            where: { workspace_id: workspaceId, user_id: userId },
        });
        if (!m) throw new ForbiddenException('Access denied');
        return m;
    }

    private async requireAdminOrOwner(workspaceId: number, userId: number) {
        const m = await this.getMembership(workspaceId, userId);
        if (![WorkspaceRole.OWNER, WorkspaceRole.ADMIN].includes(m.role)) {
            throw new ForbiddenException('Admin or owner access required');
        }
    }

    private async requireOwner(workspaceId: number, userId: number) {
        const m = await this.getMembership(workspaceId, userId);
        if (m.role !== WorkspaceRole.OWNER) {
            throw new ForbiddenException('Owner access required');
        }
    }

    async getWorkspaceStats(userId: number) {
        const getAllWorkspaceMembers = await this.memberRepo.findAll({ where: { user_id: userId } });
        const workspaceId = getAllWorkspaceMembers?.map((item) => item?.workspace_id);
        const [active_member, active_projects] = await Promise.all([
            this.memberRepo.count({ where: { workspace_id: workspaceId, role: WorkspaceRole.MEMBER } }),
            this.projectRepo.count({ where: { workspace_id: workspaceId } })
        ])
        const result = { active_member, active_projects };
        return result;
    }
}