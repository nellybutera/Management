import { Test, TestingModule } from '@nestjs/testing';
import { CreditService } from './credit.service';
import { PrismaService } from '../../config/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// --- MOCK PRISMA SERVICE ---
const mockPrismaService = {
  credit: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
};

// --- MOCK DATA ---
const mockCreditRequest = { id: 1, userId: 1, amount: 1000, status: 'PENDING', createdAt: new Date() };
const mockApprovedCredit = { ...mockCreditRequest, status: 'APPROVED' };

// --------------------------------------------------------------------------------

describe('CreditService', () => {
  let service: CreditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Provide the mock implementation
        },
      ],
    }).compile();

    service = module.get<CreditService>(CreditService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to prevent bleed-through
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
// --------------------------------------------------------------------------------
// --- 2. Unit Tests for Each Method ---
// --------------------------------------------------------------------------------

  describe('requestCredit', () => {
    it('should successfully create a credit request', async () => {
      mockPrismaService.credit.create.mockResolvedValue(mockCreditRequest);

      await expect(service.requestCredit(1, 1000)).resolves.toEqual(mockCreditRequest);
      expect(mockPrismaService.credit.create).toHaveBeenCalledWith({
        data: { userId: 1, amount: 1000 },
      });
    });

    it('should throw BadRequestException for amount <= 0', async () => {
      await expect(service.requestCredit(1, 0)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.credit.create).not.toHaveBeenCalled();
    });
  });

  describe('approveCredit', () => {
    it('should successfully approve a PENDING credit and update user balance', async () => {
      // 1. Mock findUnique to return the PENDING credit
      mockPrismaService.credit.findUnique.mockResolvedValue(mockCreditRequest);
      // 2. Mock update to return the APPROVED credit
      mockPrismaService.credit.update.mockResolvedValue(mockApprovedCredit);
      // 3. Mock user update
      mockPrismaService.user.update.mockResolvedValue({}); // We just need it to be called

      const result = await service.approveCredit(1);

      // Check results and side effects
      expect(result).toEqual(mockApprovedCredit);
      expect(mockPrismaService.credit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'APPROVED' },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockCreditRequest.userId },
        data: { balance: { increment: mockCreditRequest.amount } },
      });
    });

    it('should return the credit if it is already APPROVED (no re-approval)', async () => {
      mockPrismaService.credit.findUnique.mockResolvedValue(mockApprovedCredit);

      const result = await service.approveCredit(1);

      expect(result).toEqual(mockApprovedCredit);
      expect(mockPrismaService.credit.update).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if credit does not exist', async () => {
      mockPrismaService.credit.findUnique.mockResolvedValue(null);

      await expect(service.approveCredit(999)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('listPending', () => {
    it('should return a list of pending credit requests', async () => {
        const pendingList = [mockCreditRequest];
        mockPrismaService.credit.findMany.mockResolvedValue(pendingList);

        await expect(service.listPending()).resolves.toEqual(pendingList);
        expect(mockPrismaService.credit.findMany).toHaveBeenCalledWith({ 
            where: { status: 'PENDING' }, 
            include: { user: true } 
        });
    });
  });
});