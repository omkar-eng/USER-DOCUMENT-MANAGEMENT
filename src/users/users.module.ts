import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import TypeOrmModule with User entity
  providers: [UsersService], // Provide the UsersService
  controllers: [UsersController], // Register the UsersController
  exports: [UsersService],
})
export class UsersModule {}