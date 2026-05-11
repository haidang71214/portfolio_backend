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

    if (!requiredRoles) return true; // Nếu API không yêu cầu role nào thì cho qua

    // 2. Lấy user từ Request (do JwtAuthGuard dán vào trước đó)
    const { user } = context.switchToHttp().getRequest();

    // 3. Kiểm tra xem Role của User có nằm trong danh sách cho phép không
    const hasRole = requiredRoles.some((role) => user.role?.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền admin để làm việc này!');
    }
    
    return true;
  }
}
