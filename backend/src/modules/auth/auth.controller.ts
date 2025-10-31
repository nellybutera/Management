import { Controller, Post, Body, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RtJwtAuthGuard } from './guards/rt-jwt-auth.guard';
import { ApiBearerAuth, ApiProperty, ApiOperation } from '@nestjs/swagger';
import { UseGuards, Req, HttpCode } from '@nestjs/common';


class LoginResponse {
    @ApiProperty()
    access_token: string;
    @ApiProperty()
    refresh_token: string;
    @ApiProperty({ enum: ['ADMIN', 'CUSTOMER'] })
    role: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() dto: RegisterDto) {
    try {
      // Assuming AuthService.register throws specific errors
      return await this.authService.register(dto);
    } catch (error) {
      // Handling expected errors first
      if (error.message === 'User already exists') { 
        throw new ConflictException('A user with this email already exists.');
      }
      
      // Handle any unexpected errors
      throw new InternalServerErrorException('Registration failed due to an unexpected server error.');
    }
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      //Handle expected errors first
      if (error.message === 'Invalid credentials') {
        throw new UnauthorizedException('Invalid email or password.');
      }
      
      // Handle any unexpected errors
      throw new InternalServerErrorException('Login failed due to an unexpected server error.');
    }
  }

  //Refresh Session
  @Post('refresh')
  @HttpCode(200) // Ensure a 200 OK status on success
  @ApiOperation({ summary: 'Use Refresh Token to get a new Access Token' })
  @ApiBody({ 
      schema: { 
          type: 'object', 
          properties: { refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiI...' } } 
      } 
  })
  @ApiResponse({ status: 200, description: 'New tokens issued', type: LoginResponse })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @UseGuards(RtJwtAuthGuard) 
  async refresh(@Req() req: Request & { user: any }) {
    const { id, role, refreshToken } = req.user; // Data passed from RtJwtStrategy
    
    // Generate new tokens
    const tokens = await this.authService.getTokens(id, role);
    
    // Update the stored RT hash (revokes the old one)
    await this.authService.updateRtHash(id, tokens.refresh_token);
    
    return tokens;
  }
  
  // Logout (Token Revocation)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke the session/Refresh Token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @UseGuards(JwtAuthGuard) // Use Access Token to authenticate the logout request
  async logout(@Req() req: Request & { user: any }) {
    await this.authService.clearRtHash(req.user.id);
    return { message: 'Successfully logged out and session revoked.' };
  }
}
