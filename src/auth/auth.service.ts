import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser } from '../users/user.interface';
import { BlacklistedTokens } from './blacklist.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(BlacklistedTokens) private readonly blackListedRepository: Repository<BlacklistedTokens>,
  ) { }

  async register(email: string, password: string, role: string = 'viewer'): Promise<IUser> {
    return this.usersService.create({ email, password, role, createdAt: new Date(), updatedAt: new Date() });
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return {
        access_token: this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }),
        user: result,
      };
    }
    throw new Error('Invalid credentials');
  }

  async addBlacklistToken(token: string): Promise<void> {
    const blackListedToken = this.blackListedRepository.create({ token });
    this.blackListedRepository.save(blackListedToken);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blackListedRepository.findOne({ where: { token } });
    return !!blacklistedToken;
  }
}