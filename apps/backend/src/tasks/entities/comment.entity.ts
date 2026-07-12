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
import { Task } from './task.entity';
import { User } from 'src/users/entities/user.entity';

@Table({ tableName: 'comments', timestamps: true })
export class Comment extends Model {
    @Column({ type: DataType.TEXT, allowNull: false })
    declare content: string;

    @ForeignKey(() => Task)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare task_id: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare user_id: number;

    @BelongsTo(() => Task)
    declare task: Task;

    @BelongsTo(() => User)
    declare author: User;

    @CreatedAt declare created_at: Date;
    @UpdatedAt declare updated_at: Date;
}