import { Controller, Post, Body, UsePipes, ValidationPipe, Req, Res, Inject, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { IUser } from '../users/user.interface';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() body: CreateUserDto): Promise<IUser > {
    try {
      return await this.authService.register(body.email, body.password, body.role);
    } catch (error) {
      this.logger.error('Registration failed', error.stack);
      throw error;
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() body: LoginUserDto): Promise<{ access_token: string; user: User }> {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      throw error;
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        await this.authService.addBlacklistToken(token);
        this.logger.log(`User  logged out successfully: ${token}`);
        return res.status(200).send({ message: 'Logged out successfully' });
      } catch (error) {
        this.logger.error('Logout failed', error.stack);
        return res.status(500).send({ message: 'Internal server error' });
      }
    }
    return res.status(400).send({ message: 'No token provided' });
  }
}