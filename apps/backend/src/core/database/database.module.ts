import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                dialect: 'mysql',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                autoLoadModels: true,
                synchronize: configService.get('ENVIRONMENT') === 'DEVELOPMENT',
                logging: configService.get('ENVIRONMENT') === 'DEVELOPMENT',
            }),
        }),
    ]

})
export class DatabaseModule { }