import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { BlacklistedTokens } from './blacklist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    TypeOrmModule.forFeature([BlacklistedTokens]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.getOrThrow<string>('JWT_EXPIRATION_IN_SECONDS'),
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, Reflector],
  controllers: [AuthController]

})
export class AuthModule {}