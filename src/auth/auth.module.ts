import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeyModule } from '../key/key.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports:[KeyModule,EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
