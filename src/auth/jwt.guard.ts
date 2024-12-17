import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthPayload } from './auth.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user: AuthPayload = request.user;
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    return requiredRoles.includes(user.role);
  }
}