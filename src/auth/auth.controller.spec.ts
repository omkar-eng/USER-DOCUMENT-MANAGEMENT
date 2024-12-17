import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { User } from '../users/user.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockUser ),
    login: jest.fn().mockResolvedValue({ access_token: 'token', user: mockUser  }),
    addBlacklistToken: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  it('should register a user', async () => {
    const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password', role: 'user' };

    const result = await authController.register(createUserDto);
    expect(result).toEqual(mockUser );
    expect(authService.register).toHaveBeenCalledWith(createUserDto.email, createUserDto.password, createUserDto.role);
  });

  it('should throw BadRequestException on registration failure', async () => {
    const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password', role: 'user' };
    (authService.register as jest.Mock).mockRejectedValue(new BadRequestException('Registration failed'));

    await expect(authController.register(createUserDto)).rejects.toThrow(BadRequestException);
  });

  it('should login a user', async () => {
    const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password' };

    const result = await authController.login(loginUserDto);
    expect(result).toEqual({ access_token: 'token', user: mockUser  });
    expect(authService.login).toHaveBeenCalledWith(loginUserDto.email, loginUserDto.password);
  });

  it('should throw BadRequestException on login failure', async () => {
    const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password' };
    (authService.login as jest.Mock).mockRejectedValue(new BadRequestException('Login failed'));

    await expect(authController.login(loginUserDto)).rejects.toThrow(BadRequestException);
  });

  it('should logout a user', async () => {
    const req = { headers: { authorization: 'Bearer token' } } as Request;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;

    await authController.logout(req, res);
    expect(authService.addBlacklistToken).toHaveBeenCalledWith('token');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ message: 'Logged out successfully' });
  });

  it('should return 400 if no token is provided on logout', async () => {
    const req = { headers: {} } as Request;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;

    await authController.logout(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('should handle errors during logout', async () => {
    const req = { headers: { authorization: 'Bearer token' } } as Request;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as unknown as Response;
    (authService.addBlacklistToken as jest.Mock).mockRejectedValue(new InternalServerErrorException('Logout failed'));

    await authController.logout(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});