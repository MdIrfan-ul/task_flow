import {
    Column,
    DataType,
    Model,
    Table,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
} from 'sequelize-typescript';
import { USERS } from '../constants/user-constant';
import { UserType } from '../enums/user-enum';

@Table({ tableName: USERS, paranoid: true, deletedAt: 'deleted_at', timestamps: true })
export class User extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Column({ type: DataType.STRING, allowNull: true })
    profile: string;

    @Column({ type: DataType.ENUM(UserType.ADMIN), allowNull: false, defaultValue: UserType.ADMIN })
    user_type: boolean;

    @Column({ type: DataType.BOOLEAN, allowNull: true, })
    is_user_verified: boolean;

    @CreatedAt
    created_at: Date;

    @UpdatedAt
    updated_at: Date;

    @DeletedAt
    deleted_at: Date;
}