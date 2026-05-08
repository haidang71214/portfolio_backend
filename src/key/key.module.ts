import { Module, Global } from '@nestjs/common';
import { KeyService } from './key.service';

@Global() 
@Module({
  providers: [KeyService],
  exports: [KeyService], 
})
export class KeyModule {}