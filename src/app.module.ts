import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, EmailModule, UsersModule, CloudinaryModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
