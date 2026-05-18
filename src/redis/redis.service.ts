import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisMaster: Redis;
  private readonly redisSlave: Redis;
  private pendingRequests = new Map<string, Promise<any>>();

   constructor() {
    this.redisMaster = new Redis(process.env.DB_REDIS_MASTER || process.env['DB_REDIS_MASTER'] as string);
    this.redisSlave = new Redis(process.env.DB_REDIS_SLAVE || process.env['DB_REDIS_SLAVE'] as string);
  }


  onModuleDestroy() {
    this.redisMaster.disconnect();
    this.redisSlave.disconnect();
  }

  /**
   * Hàm lấy Cache (Đọc từ Slave) hoặc gọi DB và Ghi Cache (Ghi vào Master)
   */
  async getOrSet<T>(key: string, ttl: number, fetchFunction: () => Promise<T>): Promise<T> {
    
    // ==========================================
    // BƯỚC 1: ĐỌC TỪ CON SLAVE
    // ==========================================
    const cachedData = await this.redisSlave.get(key); 
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }

    // Kiểm tra xem đã có ai đang đi hỏi DB chưa (Chống Cache Stampede)
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key); // Có rồi thì đứng hóng
    }

    // ==========================================
    // BƯỚC 2: CHỌC DB & GHI VÀO CON MASTER
    // ==========================================
    const promise = (async () => {
      try {
        const data = await fetchFunction(); // Chọc DB

        if (data !== null && data !== undefined) {
           // Lấy xong thì GHI VÀO CON MASTER
           await this.redisMaster.set(key, JSON.stringify(data), 'EX', ttl);
        }
        
        return data;
      } finally {
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, promise);
    return promise;
  }
}
