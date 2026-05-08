import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailServiceModule } from './email-service/email-service.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [AuthModule, UserModule, EmailServiceModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
