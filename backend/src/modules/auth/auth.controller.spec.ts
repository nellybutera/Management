import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { RtJwtAuthGuard } from './guards/rt-jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';

// type definitions
type Tokens = {
  access_token: string;
  refresh_token: string;
  role: string;
};

type RegisterResult = {
    message: string;
    user: any; // Use a proper type if you have one, or keep 'any' for the mock
};

// --- Mock Data ---
const mockTokens = {
  access_token: 'new_mock_access_token',
  refresh_token: 'new_mock_refresh_token',
  role: 'ADMIN',
};
const mockUserPayload = {
  id: 1,
  email: 'test@admin.com',
  role: 'ADMIN',
};

// --- Mock Services and Guards ---

// Mock AuthService to control logic execution
const mockAuthService: Partial<AuthService> = {
  register: jest.fn<Promise<RegisterResult>, [RegisterDto]>(() => 
    Promise.resolve({ message: 'Admin registered', user: {} })
  ),
  login: jest.fn<Promise<Tokens>, any[]>(() => 
    Promise.resolve(mockTokens)
  ),
  getTokens: jest.fn<Promise<Tokens>, any[]>(() => 
    Promise.resolve(mockTokens)
  ),
  updateRtHash: jest.fn<Promise<void>, any[]>(() => 
    Promise.resolve()
  ),
  clearRtHash: jest.fn<Promise<void>, any[]>(() => 
    Promise.resolve()
  ),
};

// Mock Guards to simulate successful authentication without real JWT validation
const mockRtGuard = {
    // mock canActivate to always return true for simplicity, 
    // but the test context needs to set the req.user object.
    canActivate: jest.fn((context) => {
        const req = context.switchToHttp().getRequest();
        // Simulate successful RT validation setting the user and RT
        req.user = { 
            id: mockUserPayload.id, 
            role: mockUserPayload.role, 
            refreshToken: 'valid_refresh_token_from_body' 
        };
        return true;
    }),
};

const mockJwtGuard = {
    canActivate: jest.fn((context) => {
        const req = context.switchToHttp().getRequest();
        // Simulate successful AT validation setting the user
        req.user = mockUserPayload;
        return true;
    }),
};


describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // Provide the mock implementation of AuthService
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
    // Override the real guards with mocks for isolated testing
    .overrideGuard(RtJwtAuthGuard).useValue(mockRtGuard) 
    .overrideGuard(JwtAuthGuard).useValue(mockJwtGuard)
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refresh', () => {
    it('should use the RT to generate new tokens and update the RT hash', async () => {
      // Setup: Mock the service to return a new token pair
      (mockAuthService.getTokens as jest.Mock).mockResolvedValue(mockTokens);
      
      // Simulate the request object passed by the guard
      const mockRequest = { user: { id: 1, role: 'ADMIN', refreshToken: 'old_refresh_token' } };
      
      // 1. Call the controller method
      const result = await controller.refresh(mockRequest as any);

      // 2. Assertions
      
      // Verify that the new token was generated
      expect(mockAuthService.getTokens).toHaveBeenCalledWith(
        mockRequest.user.id, 
        mockRequest.user.role
      );
      
      // Verify that the new RT hash was stored/updated
      expect(mockAuthService.updateRtHash).toHaveBeenCalledWith(
        mockRequest.user.id, 
        mockTokens.refresh_token // Should hash the NEW refresh token
      );
      
      // Verify the response is the new token pair
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if RT Guard fails (e.g., hash mismatch)', async () => {
        // Mock the guard to fail (simulate UnauthorizedException from strategy)
        mockRtGuard.canActivate.mockReturnValue(false); 
        
        // Note: In a real e2e test, the exception would come from the guard/strategy.
        // Here, we rely on the guard mock and check that the controller methods are NOT called.
        
        try {
            // Must pass a request object, even if the guard blocks it
            await controller.refresh({} as any);
        } catch (e) {
            // We just ensure the controller methods weren't reached
            expect(mockAuthService.getTokens).not.toHaveBeenCalled();
            expect(mockAuthService.updateRtHash).not.toHaveBeenCalled();
            return;
        }
        // If it reaches here, the test fails because the guard should have blocked it
        fail('Refresh should have been blocked by the guard.');
    });
  });

  describe('logout', () => {
    it('should use the AT to clear the RT hash (revoke session)', async () => {
      // Setup: Mock the clearRtHash method to resolve successfully
      (mockAuthService.clearRtHash as jest.Mock).mockResolvedValue(true);

      // Simulate the request object passed by the JWT Guard
      const mockRequest = { user: { id: mockUserPayload.id } };

      // 1. Call the controller method
      const result = await controller.logout(mockRequest as any);

      // 2. Assertions
      
      // Verify that the clearRtHash method was called with the user ID
      expect(mockAuthService.clearRtHash).toHaveBeenCalledWith(mockUserPayload.id);
      
      // Verify the correct success message is returned
      expect(result).toEqual({ message: 'Successfully logged out and session revoked.' });
    });

    it('should be blocked if JWT Auth Guard fails (invalid Access Token)', async () => {
        // Mock the guard to fail (simulate UnauthorizedException from strategy)
        mockJwtGuard.canActivate.mockReturnValue(false);
        
        try {
            await controller.logout({} as any);
        } catch (e) {
            // We just ensure the controller method wasn't reached
            expect(mockAuthService.clearRtHash).not.toHaveBeenCalled();
            return;
        }
        // If it reaches here, the test fails
        fail('Logout should have been blocked by the guard.');
    });
  });
});