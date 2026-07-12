import {
    Column,
    DataType,
    Model,
    Table,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Workspace } from './workspace.entity';

export enum WorkspaceRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}

@Table({ tableName: 'workspace_members', timestamps: true })
export class WorkspaceMember extends Model {
    @ForeignKey(() => Workspace)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare workspace_id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare user_id: number;

    @Column({
        type: DataType.ENUM(...Object.values(WorkspaceRole)),
        allowNull: false,
        defaultValue: WorkspaceRole.MEMBER,
    })
    declare role: WorkspaceRole;

    @BelongsTo(() => Workspace)
    declare workspace: Workspace;

    @BelongsTo(() => User)
    declare user: User;

    @CreatedAt declare created_at: Date;
    @UpdatedAt declare updated_at: Date;
}