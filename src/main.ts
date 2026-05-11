import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // 1. Import cái này

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Sử dụng cookie-parser
  app.use(cookieParser());

  // 3. Cấu hình CORS (Rất quan trọng để FE gửi được Cookie)
  app.enableCors({
    origin: 'http://localhost:8080', // Thay bằng URL của Frontend bạn
    credentials: true, // Cho phép trình duyệt gửi Cookie lên
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
