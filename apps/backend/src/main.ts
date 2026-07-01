import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";

const configService = new ConfigService();
const APP_PORT = configService.get<number>('APP_PORT') || 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(APP_PORT, () => {
    console.log(`Server is running on port:⚡${APP_PORT}⚡`);
  });
}
bootstrap();
