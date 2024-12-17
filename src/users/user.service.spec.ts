import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import {Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository:Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>('UserRepository');
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = { email: 'test@example.com', password: 'password123', role: 'viewer', createdAt: new Date(), updatedAt: new Date() };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const savedUser  = { ...userData, password: hashedPassword };

      userRepository.create = jest.fn().mockReturnValue(savedUser );
      userRepository.save = jest.fn().mockResolvedValue(savedUser );

      const result = await service.create(userData);
      expect(result).toEqual(savedUser );
      expect(userRepository.create).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
      expect(userRepository.save).toHaveBeenCalledWith(savedUser );
    });

    it('should throw an error if user creation fails', async () => {
      const userData = { email: 'test@example.com', password: 'password123', role: 'viewer', createdAt: new Date(), updatedAt: new Date() };
      userRepository.create = jest.fn().mockReturnValue(userData);
      userRepository.save = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(service.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedpassword', role: 'viewer', createdAt: new Date(), updatedAt: new Date() };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return undefined if user not found', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedpassword', role: 'viewer', createdAt: new Date(), updatedAt: new Date() };
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await service.findById(1);
      expect(result).toEqual(user);
    });

    it('should throw UserNotFoundException if user not found', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(service.findById(999)).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedpassword', role: 'viewer', createdAt: new Date(), updatedAt: new Date() };
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      userRepository.delete = jest.fn().mockResolvedValue(undefined);

      await service.delete(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.delete).toHaveBeenCalledWith(user.id);
    });

    it('should throw UserNotFoundException if user to delete does not exist', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(service.delete(999)).rejects.toThrow(UserNotFoundException);
    });
  });
});