import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create(AppModule);
  
  // Get config
  const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:5173';
  const port = configService.get('PORT') || 3000;

  // Enable CORS for the React frontend
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
