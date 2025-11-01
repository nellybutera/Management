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
    update: jest.fn()
  },
};

const mockAccessToken = 'mock_at';
const mockRefreshToken = 'mock_rt';
const mockJwtService = {
  // Mock signAsync to return AT for the first call, RT for the second call
  signAsync: jest.fn().mockImplementation(async (payload, options) => {
    if (options?.expiresIn === '3h') return mockAccessToken;
    if (options?.expiresIn === '7d') return mockRefreshToken;
    return 'default_token';
  }),
};


// mocking bcrypt functions (jest.mock('bcrypt') is also needed at the file level)
jest.mock('bcrypt', () => ({
    hash: jest.fn(async (data) => `hashed_${data}`),
    compare: jest.fn(async (data, hash) => hash === `hashed_${data}`),
}));


// mock data
const mockUser = { 
  id: 1, 
  email: 'test@example.com', 
  password: 'hashed_password',
  role: 'ADMIN', 
  name: 'Test Admin', 
  balance: 0,
  refreshTokenHash: null, 
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
    (bcrypt.hash as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokens', () => {
    it('should return both access and refresh tokens with correct expiries', async () => {
      const tokens = await service.getTokens(1, 'ADMIN');

      expect(tokens).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        role: 'ADMIN',
      });

      // Verify JwtService signAsync calls
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { id: 1, role: 'ADMIN' },
        { expiresIn: '3h' }
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { id: 1, role: 'ADMIN' },
        { expiresIn: '7d' }
      );
    });
  });

  describe('register', () => {
    const registerDto = { email: 'new@admin.com', password: 'password', name: 'New Admin' };
    const registeredUser = { ...mockUser, email: registerDto.email, name: registerDto.name };

    it('should successfully register a new user with ADMIN role', async () => {
      mockPrismaService.user.create.mockResolvedValue(registeredUser);

      const result = await service.register(registerDto);

    // verifying bcrypt was called
    expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
   
    // verify user is admin
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: { ...registerDto, password: `hashed_password`, role: 'ADMIN' },
    });

    expect(result.message).toBe('Admin registered'); // verify updated message
    // Ensure password is removed from the returned object
    expect(result.user).toEqual(expect.not.objectContaining({ password: expect.any(String) }));
    });

    it('should throw ConflictException for existing email', async () => {
      const mockP2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.18.0' }
      );
    mockPrismaService.user.create.mockRejectedValue(mockP2002Error);

    await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    // verify updated error message
    await expect(service.register(registerDto)).rejects.toThrow('Admin user with this email already exists');
    });

    it('should re-throw unknown errors', async () => {
      mockPrismaService.user.create.mockRejectedValue(new Error('DB error'));
      await expect(service.register(registerDto)).rejects.toThrow('DB error');
    });
  });

  describe('login', () => {
    const loginDto = { email: mockUser.email, password: 'password' };
    let serviceSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on getTokens and updateRtHash, since we rely on their implementation
      serviceSpy = jest.spyOn(service, 'getTokens');
      jest.spyOn(service, 'updateRtHash');
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); 
    });


    it('should successfully log in, return tokens, and store RT hash', async () => {
      const expectedTokens = {
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          role: mockUser.role,
        };
        serviceSpy.mockResolvedValue(expectedTokens);

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalled();
        
      // verify token generation and RT hash storage
      expect(service.getTokens).toHaveBeenCalledWith(mockUser.id, mockUser.role);
      expect(service.updateRtHash).toHaveBeenCalledWith(mockUser.id, mockRefreshToken);
      
      expect(result).toEqual(expectedTokens);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.getTokens).not.toHaveBeenCalled();
      expect(service.updateRtHash).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); 

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.getTokens).not.toHaveBeenCalled();
      expect(service.updateRtHash).not.toHaveBeenCalled();
    });
  });

  // new rt hash methods
  describe('updateRtHash', () => {
    it('should hash the RT and update the user record', async () => {
      const mockHashedRt = 'hashed_mock_rt_123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedRt);

      await service.updateRtHash(1, mockRefreshToken);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRefreshToken, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshTokenHash: mockHashedRt },
      });
    });
  });

  describe('clearRtHash', () => {
    it('should set refreshTokenHash to null to revoke session', async () => {
        await service.clearRtHash(1);

        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { refreshTokenHash: null },
        });
    });
  });

});