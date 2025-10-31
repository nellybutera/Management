import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RtJwtStrategy } from './strategies/rt-jwt.strategy';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({ 
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3h' },
      }),
      inject: [ConfigService],
    }),
],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtJwtStrategy, { provide: 'BCRYPT', useValue: bcrypt }],
  exports: [AuthService],
})
export class AuthModule {}
