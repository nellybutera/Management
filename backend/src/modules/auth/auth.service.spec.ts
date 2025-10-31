import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';


// mocking specific Prisma methods used by AuthService
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

// mocking JwtService methods used by AuthService
const mockJwtService = {
  signAsync: jest.fn(() => 'mockAccessToken'),
};

// mocking bcrypt functions (jest.mock('bcrypt') is also needed at the file level)
jest.mock('bcrypt', () => ({
    hash: jest.fn(async (password) => `hashed_${password}`),
    compare: jest.fn(async (password, hash) => hash === `hashed_${password}`),
}));


// mock data
const mockUser = { 
  id: 1, 
  email: 'test@example.com', 
  password: 'hashed_password', // Mocked hashed password
  role: 'CUSTOMER', 
  name: 'Test User', 
  balance: 0,
  createdAt: new Date(),
};


describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // important: provide the mock for each dependency
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('register', () => {
    const registerDto = { email: 'new@user.com', password: 'password', name: 'New User' };

    it('should successfully register a new user and return user data', async () => {
      // setuping mock return value for successful creation
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      // verifying bcrypt was called
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      
      // verifying Prisma create was called with the hashed password
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { ...registerDto, password: `hashed_password` },
      });
      
      // verifying the returned message
      expect(result.message).toBe('User registered');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw ConflictException if user email already exists (P2002 error)', async () => {
      const mockP2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        { code: 'P2002', clientVersion: '6.18.0' }
      )
      // mocking Prisma to throw a P2002 error
      mockPrismaService.user.create.mockRejectedValue(mockP2002Error)
        
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should re-throw unknown errors', async () => {
      // mocking Prisma to throw a generic error
      mockPrismaService.user.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.register(registerDto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('login', () => {
    const loginDto = { email: mockUser.email, password: 'password' };

    it('should successfully log in and return access token and role', async () => {
      // mocking findUnique to return the user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      // mocking bcrypt.compare to return true (password matches)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); 

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ id: mockUser.id, role: mockUser.role });
      
      expect(result).toEqual({ access_token: 'mockAccessToken', role: mockUser.role });
    });

    it('should throw UnauthorizedException for invalid email (user not found)', async () => {
      // mocking findUnique to return null
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // mocking findUnique to return the user
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      // mocking bcrypt.compare to return false (password mismatch)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); 

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });

});