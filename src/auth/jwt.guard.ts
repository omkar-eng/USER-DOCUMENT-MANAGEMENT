import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthPayload } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    // Call the parent canActivate method to validate the JWT
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid access token');
    }

    // Proceed to role validation if JWT is valid
    const user: AuthPayload = request.user; // Get user from request
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    // Check if user has required roles
    return requiredRoles.includes(user.role);
  }
}