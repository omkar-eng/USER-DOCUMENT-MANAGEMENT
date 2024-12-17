import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from './user.service';
import * as bcrypt from 'bcrypt';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUser } from './user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserNotFoundException } from '../common/exceptions/user-not-found.exception';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Roles('admin')
  async register(@Body() body: CreateUserDto): Promise<IUser > {
    try {
      this.logger.log('Registering a new user');
      return await this.usersService.create(body);
    } catch (error) {
      this.logger.error('Error registering user', error.stack);
      if (error instanceof UserNotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to register user');
      }
    }
  }

  @Get(':id')
  @Roles('admin', 'viewer', 'editor')
  async findOne(@Param('id') id: string): Promise<IUser > {
    try {
      this.logger.log(`Fetching user with id: ${id}`);
      const user = await this.usersService.findById(+id);
      if (!user) {
        this.logger.warn(`User  with id ${id} not found`);
        throw new UserNotFoundException();
      }
      return user;
    } catch (error) {
      this.logger.error('Error fetching user', error.stack);
      if (error instanceof UserNotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to fetch user');
      }
    }
  }

  @Put(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<IUser > {
    try {
      this.logger.log(`Updating user with id: ${id}`);
      const user = await this.usersService.findById(+id);
      if (!user) {
        this.logger.warn(`User  with id ${id} not found`);
        throw new UserNotFoundException();
      }
      if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
      }
      return await this.usersService.update(+id, body);
    } catch (error) {
      this.logger.error('Error updating user', error.stack);
      if (error instanceof UserNotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to update user');
      }
    }
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      this.logger.log(`Deleting user with id: ${id}`);
      const user = await this.usersService.findById(+id);
      if (!user) {
        this.logger.warn(`User  with id ${id} not found`);
        throw new UserNotFoundException();
      }
      await this.usersService.delete(+id);
      this.logger.log(`User  with id ${id} deleted successfully`);
    } catch (error) {
      this.logger.error('Error deleting user', error.stack);
      if (error instanceof UserNotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to delete user');
      }
    }
  }
}