import {
    Column,
    DataType,
    Model,
    Table,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    BeforeCreate,
} from 'sequelize-typescript';
import { USERS } from '../constants/user-constant';
import { UserType } from '../enums/user-enum';
import { hashPassword } from 'src/utils/password.util';



@Table({ tableName: USERS, paranoid: true, deletedAt: 'deleted_at', timestamps: true })
export class User extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string;

    @Column({ type: DataType.STRING, allowNull: true })
    declare profile: string;

    @Column({ type: DataType.ENUM(...Object.values(UserType)), allowNull: false, defaultValue: UserType.ADMIN })
    declare user_type: UserType;

    @Column({ type: DataType.BOOLEAN, allowNull: true })
    declare is_user_verified: boolean;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare updated_at: Date;

    @DeletedAt
    declare deleted_at: Date;

    @BeforeCreate
    static async hashPasswordHook(instance: User) {

        if (instance.changed('password')) {
            const plainPassword = instance.getDataValue('password')
            const hashed = await hashPassword(plainPassword)
            instance.setDataValue('password', hashed)
        }
    }
}