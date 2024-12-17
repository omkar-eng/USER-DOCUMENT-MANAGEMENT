import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';
import { IUser } from './user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({ ...userData, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({where : { email }});
  }

  async findById(id: number): Promise<IUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async update(id: number, userData: Partial<User>): Promise<IUser> {
    const user = await this.findById(id); // Check if user exists
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10); // Hash the new password if provided
    }
    await this.userRepository.update(id, userData); // Update the user in the repository
    return this.findById(id); // Return the updated user
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.delete(user.id);
  }
}