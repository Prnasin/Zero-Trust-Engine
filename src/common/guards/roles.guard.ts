import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // 🔥 Role hierarchy
  private roleHierarchy = {
    USER: 1,
    ADMIN: 2,
    SUPERADMIN: 3,
  };

  canActivate(context: ExecutionContext): boolean {
    // 1. Get roles required by route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY, //

      [context.getHandler(), context.getClass()],
    );

    // 2. If no roles required → allow access
    if (!requiredRoles) {
      return true;
    }

    // 3. Get request & user (from AuthGuard)
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: any }>();

    const user = request.user;

    // 4. If no user or role → block
    if (!user || !user.role) {
      throw new ForbiddenException('No role found');
    }

    // 5. Convert role → numeric level
    const userLevel = this.roleHierarchy[user.role];

    // 6. Check if user has required role
    const hasAccess = requiredRoles.some((role) => {
      return userLevel >= this.roleHierarchy[role];
    });

    // 7. If not allowed → block
    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
