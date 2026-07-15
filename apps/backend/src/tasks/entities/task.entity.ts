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
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './comment.entity';

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}

export enum TaskPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

@Table({ tableName: 'tasks', paranoid: true, deletedAt: 'deleted_at', timestamps: true })
export class Task extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    declare title: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare description: string;

    @Column({
        type: DataType.ENUM(...Object.values(TaskStatus)),
        allowNull: false,
        defaultValue: TaskStatus.TODO,
    })
    declare status: TaskStatus;

    @Column({
        type: DataType.ENUM(...Object.values(TaskPriority)),
        allowNull: false,
        defaultValue: TaskPriority.MEDIUM,
    })
    declare priority: TaskPriority;

    @Column({ type: DataType.INTEGER, allowNull: true, defaultValue: 0 })
    declare order: number;

    @Column({ type: DataType.DATE, allowNull: true })
    declare due_date: Date;

    @ForeignKey(() => Project)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare project_id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: true })
    declare assignee_id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare created_by: number;

    @BelongsTo(() => Project)
    declare project: Project;

    @BelongsTo(() => User, 'assignee_id')
    declare assignee: User;

    @BelongsTo(() => User, 'created_by')
    declare creator: User;

    @HasMany(() => Comment)
    declare comments: Comment[];

    @Column({ type: DataType.STRING, allowNull: true })
    declare task_label: string;

    @CreatedAt declare created_at: Date;
    @UpdatedAt declare updated_at: Date;
    @DeletedAt declare deleted_at: Date;
}