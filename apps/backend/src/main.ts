import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { createCorsConfig } from './config/cors.config';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { IMAGES_ROOT } from './common/path';

const configService = new ConfigService();
const APP_PORT = configService.get<number>('APP_PORT') || 8000;

const logger = new Logger('Bootstrap');
const isProduction = process.env.ENVIRONMENT === 'PRODUCTION';
const appLogLevels: LogLevel[] = isProduction
  ? ['warn', 'error']
  : ['log', 'warn', 'error', 'debug', 'verbose'];


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: appLogLevels });
  app.enableCors(createCorsConfig(configService))
  app.useGlobalPipes(
    new ValidationPipe({
      strictGroups: true,
      whitelist: true,              // strips unknown fields
      forbidNonWhitelisted: true,
      transform: true
    }),
  );
  app.useStaticAssets(IMAGES_ROOT, { prefix: '/images' });
  app.set('trust proxy', true);
  app.use(cookieParser());

  await app.listen(APP_PORT, () => {
    console.log(`Server is running on port:⚡${APP_PORT}⚡`);
  });
}
bootstrap();
