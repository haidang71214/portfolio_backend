// src/auth/guard/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy ra những role được phép truy cập API này (từ decorator @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // ở đây, nó sẽ cần check chính xác cái api mà decorator đang xài
    // handle là get post put delete, còn get class là các hàm UserController
    // từ đó có thể biết được là à, decorator này được sử dụng ở vị trí nào

    if (!requiredRoles) return true; // Nếu API không yêu cầu role nào thì cho qua

    // 2. Lấy user từ Request (do JwtAuthGuard dán vào trước đó)
    // ở bước này, mình sẽ decode cái token của user đã mã hóa ở login
    // cái {user} cho chúng ta biết nó đang là kiểu req.user
    const { user } = context.switchToHttp().getRequest();

    // 3. Kiểm tra xem Role của User có nằm trong danh sách cho phép không
    // ở đây, nó sẽ check role, weo, căn bản là thế thôi
    const hasRole = requiredRoles.some((role) => user.role?.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền để làm việc này!');
    }
    
    return true;
  }
}
