import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../constants/database-constant';
import { sequelizeModels } from './sequelize.models';

export const DatabaseProviders = [
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
                logging: configService.get('NODE_ENV') === 'development',
            });

            sequelize.addModels(sequelizeModels);

            await sequelize.authenticate();

            // Sync only in development
            if (configService.get('ENVIRONMENT') === 'DEVELOPMENT') {
                await sequelize.sync();
            }

            return sequelize;
        },
    },
];