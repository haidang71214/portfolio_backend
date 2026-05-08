import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Portfolio Backend API') // Tên dự án của bạn
    .setDescription('Danh sách API cho hệ thống backend')
    .setVersion('1.0')
    .addBearerAuth() // Thêm cấu hình Token nếu bạn dùng JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('swagger', app, document);

   console.log(`App listen on ${3000} thì phải chứ không nhớ á sr =))`);
  await app.listen(3000);
   
}
bootstrap();