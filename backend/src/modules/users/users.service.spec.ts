import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../config/prisma.service'
import * as bcrypt from 'bcrypt'; 


// mocking bcrypt hash function
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (password) => `hashed_${password}_update`),
}));

// Mocking the entire PrismaService
const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  const mockUser = { 
    id: 1, 
    email: 'test@example.com', 
    name: 'Test Admin', 
    role: 'ADMIN', 
    balance: 0 
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, 
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    (bcrypt.hash as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('update', () => {
    const userId = 1;
    const updateNameDto = { name: 'New Name' };
    const updatePasswordDto = { password: 'newpassword' };
    const expectedHashedPassword = 'hashed_newpassword_update';

    it('should update name without hashing password', async () => {
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, name: updateNameDto.name });

      await service.update(userId, updateNameDto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateNameDto,
      });
    });

    it('should hash and update the password if provided', async () => {
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, password: expectedHashedPassword });

      await service.update(userId, updatePasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: expectedHashedPassword },
      });
    });
  });
  
  describe('clearRtHash', () => {
      it('should clear the refresh token hash from the user record', async () => {
          const userId = 1;
          mockPrismaService.user.update.mockResolvedValue({});

          await service.clearRtHash(userId);

          expect(mockPrismaService.user.update).toHaveBeenCalledWith({
              where: { id: userId },
              data: { refreshTokenHash: null },
          });
      });
  });
  
  // test for the remove method
  describe('remove', () => {
    it('should delete the user record', async () => {
      const userId = 1;
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove(userId);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});