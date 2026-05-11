import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashModule } from '../hash/Hash.Controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[HashModule,AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
