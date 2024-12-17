import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BlacklistedTokens } from './blacklist.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let blackListedRepository: Repository<BlacklistedTokens>;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockBlacklistedRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(BlacklistedTokens),
          useValue: mockBlacklistedRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    blackListedRepository = module.get<Repository<BlacklistedTokens>>(getRepositoryToken(BlacklistedTokens));
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const userDto = { email: 'test@example.com', password: 'password', role: 'viewer' };
      const result = { id: 1, ...userDto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await authService.register(userDto.email, userDto.password, userDto.role)).toEqual(result);
      expect(mockUsersService.create).toHaveBeenCalledWith({ ...userDto, createdAt: expect.any(Date), updatedAt: expect.any(Date) });
    });

    it('should throw an error if registration fails', async () => {
      const userDto = { email: 'test@example.com', password: 'password', role: 'viewer' };
      mockUsersService.create.mockRejectedValue(new Error('Registration failed'));

      await expect(authService.register(userDto.email, userDto.password, userDto.role)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear any previous mocks
    });

    it('should successfully log in a user and return a token', async () => {
      const user = { id: 1, email: 'test@example.com', password: await bcrypt.hash('password', 10), role: 'viewer' };
      const loginDto = { email: user.email, password: 'password' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async (password: string, hashedPassword: string): Promise<boolean> => {
        return true; // Simulate correct password
      });
      mockJwtService.sign.mockReturnValue('token'); // Mock JWT sign to return a token

      const result = await authService.login(loginDto.email, loginDto.password);
      expect(result).toEqual({
        access_token: 'token',
        user: { id: user.id, email: user.email, role: user.role },
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });

    it('should throw an error if user is not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto.email, loginDto.password)).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error if password is incorrect', async () => {
      const user = { id: 1, email: 'test@example.com', password: await bcrypt.hash('password', 10), role: 'viewer' };
      const loginDto = { email: user.email, password: 'wrongpassword' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async (password: string, hashedPassword: string): Promise<boolean> => {
        return false; // Simulate incorrect password
      });

      await expect(authService.login(loginDto.email, loginDto.password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('addBlacklistToken', () => {
    it ('should successfully add a token to the blacklist', async () => {
      const token = 'token';
      mockBlacklistedRepository.create.mockReturnValue({ token });
      mockBlacklistedRepository.save.mockResolvedValue(undefined);

      await authService.addBlacklistToken(token);
      expect(mockBlacklistedRepository.create).toHaveBeenCalledWith({ token });
      expect(mockBlacklistedRepository.save).toHaveBeenCalledWith({ token });
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true if the token is blacklisted', async () => {
      const token = 'token';
      mockBlacklistedRepository.findOne.mockResolvedValue({ token });

      const result = await authService.isTokenBlacklisted(token);
      expect(result).toBe(true);
      expect(mockBlacklistedRepository.findOne).toHaveBeenCalledWith({ where: { token } });
    });

    it('should return false if the token is not blacklisted', async () => {
      const token = 'token';
      mockBlacklistedRepository.findOne.mockResolvedValue(null);

      const result = await authService.isTokenBlacklisted(token);
      expect(result).toBe(false);
      expect(mockBlacklistedRepository.findOne).toHaveBeenCalledWith({ where: { token } });
    });
  });
});