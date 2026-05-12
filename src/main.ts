import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // 1. Import cái này

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
   origin: ['http://localhost:8080', 'http://localhost:3000'], 
  credentials: true, // Cookie lên
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Portfolio Backend API')
    .setDescription('Danh sách API cho hệ thống backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  console.log(`App listen on 3000`);
  await app.listen(3000);
}
bootstrap();
