import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../config/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  // Hash and store the Refresh Token
  async updateRtHash(userId: number, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      // Assuming you have a refreshTokenHash field in your User model
      data: { refreshTokenHash: hash }, 
    });
  }

  async clearRtHash(userId: number) {
    await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null }, // Nullify the hash to revoke all sessions
    });
}

  // method for generating tokens
  async getTokens(userId: number, role: string) {
    // 3h for Access Token, 7d for Refresh Token
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync({ id: userId, role }, { expiresIn: '3h' }), 
      this.jwtService.signAsync({ id: userId, role }, { expiresIn: '7d' }), 
    ]);
        
    return { access_token: at, refresh_token: rt, role };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    try{
        const user = await this.prisma.user.create({
            data: { 
              ...dto, 
              password: hashed,
              role: 'ADMIN' as const, 
            },
        });

        // removing password before returning for security purposes
        const { password, ...result } = user;
        return { message: 'Admin registered', user: result };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ConflictException('Admin user with email already exists');
            }
        }
        throw error;
    }
    
  }

  async login(dto: LoginDto) {
    // the try/catch here is kinda redundant since the controller also has one, but it's useful
    // to differentiate between expected errors (like Unauthorized) and unexpected ones (like dependency failures)
    try {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      
      if (!user || !(await bcrypt.compare(dto.password, user.password))) {
        throw new UnauthorizedException('Invalid credentials'); 
      }
      
      const tokens = await this.getTokens(user.id, user.role); // generating new tokens
      await this.updateRtHash(user.id, tokens.refresh_token); // hashing and storing refresh token
      return tokens;
    } catch (error) {
      // If it's a known, expected error, re-throw it (e.g., 401 Unauthorized)
      if (error instanceof UnauthorizedException) {
        throw error; 
      }
      
      // If it's an unexpected error (like 'secret must be provided' or 'P1001'), log it
      console.error("Critical Login Dependency Error:", error);
      
      // Throw a generic error to be caught by the controller's InternalServerErrorException
      throw new Error('Dependency failure during login.'); 
    }
  }

}
