import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
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
    const user = await this.findById(id);
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.delete(user.id);
  }
}