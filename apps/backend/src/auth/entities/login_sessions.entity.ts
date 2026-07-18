import {
    Column,
    DataType,
    Model,
    Table,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
} from 'sequelize-typescript';
import { LOGIN_SESSIONS } from '../constants/auth-constant';



@Table({ tableName: LOGIN_SESSIONS, paranoid: true, deletedAt: 'deleted_at', timestamps: true })
export class LoginSessions extends Model {
    @Column({ type: DataType.BIGINT, primaryKey: true, allowNull: false, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.BIGINT, allowNull: false })
    declare user_id: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    declare refresh_token: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare device_name: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare browser: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare os: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare ip_address: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare user_agent: string;


    @Column({ type: DataType.STRING, allowNull: true })
    declare last_active_at: string;

    @Column({ type: DataType.DATE, allowNull: true })
    declare expires_at: Date;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare updated_at: Date;

    @DeletedAt
    declare deleted_at: Date;

}