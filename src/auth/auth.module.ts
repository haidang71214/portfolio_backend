import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeyModule } from '../key/key.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[KeyModule,EmailModule,PrismaModule,JwtModule.register({}),],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
