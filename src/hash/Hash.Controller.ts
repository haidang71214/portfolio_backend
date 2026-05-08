import { Global, Module } from '@nestjs/common';
import { HashService } from './Hash.Service';
;

@Global()
@Module({
  providers: [HashService],
  exports: [HashService], // Phải export thì thằng khác mới dùng được
})
export class HashModule {}