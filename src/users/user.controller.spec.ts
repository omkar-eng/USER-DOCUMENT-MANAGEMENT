import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { IUser } from './user.interface';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser:  IUser = {
    id: 1,
    email: 'testuser@example.com',
    password: 'hashedpassword',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser ),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(mockUser ),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(usersService).toBeDefined();
  });

  it('should register a new user', async () => {
    const createUserDto: CreateUserDto = { email: 'testuser@example.com', password: 'password', role: 'viewer' };
    const result = await usersController.register(createUserDto);
    expect(result).toEqual(mockUser );
    expect(usersService.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should fetch a user by id', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(mockUser );
    
    const result = await usersController.findOne('1');
    expect(result).toEqual(mockUser );
    expect(usersService.findById).toHaveBeenCalledWith(1);
  });

  it('should throw UserNotFoundException if user not found', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(null);

    await expect(usersController.findOne('1')).rejects.toThrow(UserNotFoundException);
  });

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = { email: 'updateduser@example.com', password: 'newpassword', role: 'editor' };
    (usersService.findById as jest.Mock).mockResolvedValue(mockUser );
    const result = await usersController.update('1', updateUserDto);
    expect(result).toEqual(mockUser );
    expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
  });

  it('should throw UserNotFoundException when updating a non-existing user', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(null);
    await expect(usersController.update('1', {})).rejects.toThrow(UserNotFoundException);
  });

  it('should delete a user', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(mockUser );
    await usersController.delete('1');
    expect(usersService.delete).toHaveBeenCalledWith(1);
  });

  it('should throw UserNotFoundException when deleting a non-existing user', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(null);
    await expect(usersController.delete('1')).rejects.toThrow(UserNotFoundException);
  });
});