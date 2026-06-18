import { Sequelize } from 'sequelize-typescript';
import { sequelizeModels } from './sequelize.models';
import { SEQUELIZE } from '../constants/database-constant';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
    {
        provide: SEQUELIZE,
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const sequelize = new Sequelize({
                dialect: 'mysql',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                logging: false,
            });
            sequelize.addModels(sequelizeModels);
            await sequelize.sync();
            return sequelize;
        },
    },
];