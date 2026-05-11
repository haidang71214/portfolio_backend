import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeyModule } from '../key/key.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ShareModule } from '../shared/sharedModule.module';
import { HashModule } from '../hash/Hash.Controller';
import { RolesGuard } from './stratergy/role.guard';
import { KeyService } from '../key/key.service';

@Module({
  imports:[HashModule,KeyModule,EmailModule,PrismaModule,JwtModule.register({}),CloudinaryModule,ShareModule],
  controllers: [AuthController],
  providers: [AuthService,RolesGuard,JwtService,KeyService],
  exports:[AuthService,RolesGuard,JwtService,KeyService]
})
export class AuthModule {}
