import {
    Column,
    DataType,
    Model,
    Table,
    ForeignKey,
    BelongsTo,
    HasMany,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
} from 'sequelize-typescript';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Table({ tableName: 'projects', paranoid: true, deletedAt: 'deleted_at', timestamps: true })
export class Project extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare description: string;

    @ForeignKey(() => Workspace)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare workspace_id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare created_by: number;

    @BelongsTo(() => Workspace)
    declare workspace: Workspace;

    @BelongsTo(() => User, 'created_by')
    declare creator: User;

    @HasMany(() => Task)
    declare tasks: Task[];

    @CreatedAt declare created_at: Date;
    @UpdatedAt declare updated_at: Date;
    @DeletedAt declare deleted_at: Date;
}