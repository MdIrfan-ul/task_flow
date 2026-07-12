import {
    Column,
    DataType,
    Model,
    Table,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    BelongsToMany,
    HasMany,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { Project } from 'src/projects/entities/project.entity';

@Table({ tableName: 'workspaces', paranoid: true, deletedAt: 'deleted_at', timestamps: true })
export class Workspace extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare slug: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare avatar_url: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare owner_id: number;

    @BelongsTo(() => User, 'owner_id')
    declare owner: User;

    @BelongsToMany(() => User, () => WorkspaceMember)
    declare members: User[];

    @HasMany(() => WorkspaceMember)
    declare workspaceMembers: WorkspaceMember[];

    @HasMany(() => Project)
    declare projects: Project[];

    @CreatedAt declare created_at: Date;
    @UpdatedAt declare updated_at: Date;
    @DeletedAt declare deleted_at: Date;
}