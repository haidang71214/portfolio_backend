import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Dùng Global để chỗ nào cũng xài được, không cần import đi import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}