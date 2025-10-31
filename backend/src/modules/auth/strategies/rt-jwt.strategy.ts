import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';
import * as bcrypt from 'bcrypt';

// Use a different name for the JWT strategy when dealing with Refresh Tokens
@Injectable()
export class RtJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'), // extracts RT from the request body
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // Allows us to access the request object
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body.refresh_token;

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    
    if (!user) throw new UnauthorizedException('Token invalid or user not found');
    
    //  Compare the provided RT with the hashed RT in the DB
    if (!user.refreshTokenHash) throw new UnauthorizedException('Refresh token session invalid');
    
    const rtMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!rtMatches) throw new UnauthorizedException('Refresh token corrupted or revoked');

    // Return the user data and the RT for use in the controller
    return { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        refreshToken: refreshToken 
    };
  }
}