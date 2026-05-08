import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KeyService {
  // Định nghĩa các đường dẫn mặc định hoặc lấy từ env
  private readonly keys = {
    jwtPrivate: process.env['JWT_PRIVATE_KEY_PATH'] || 'keys/private.key',
    jwtPublic: process.env['JWT_PUBLIC_KEY_PATH'] || 'keys/public.key',
    refreshPrivate: process.env['JWT_REFRESH_PRIVATE_KEY_PATH'] || 'keys/refresh_private.key',
    refreshPublic: process.env['JWT_REFRESH_PUBLIC_KEY_PATH'] || 'keys/refresh_public.key',
  };

  private readKeyFile(relativeFilePath: string): string {
    try {
      const absolutePath = path.resolve(process.cwd(), relativeFilePath);
      return fs.readFileSync(absolutePath, 'utf-8');
    } catch (error: any) {
      throw new Error(`Could not find key file at path: ${relativeFilePath}. Error: ${error.message}`);
    }
  }

  getPrivateKey(): string {
    return this.readKeyFile(this.keys.jwtPrivate);
  }

  getPublicKey(): string {
    return this.readKeyFile(this.keys.jwtPublic);
  }

  getRefTokenPrivateKey(): string {
    return this.readKeyFile(this.keys.refreshPrivate);
  }

  getRefTokenPublicKey(): string {
    return this.readKeyFile(this.keys.refreshPublic);
  }
}