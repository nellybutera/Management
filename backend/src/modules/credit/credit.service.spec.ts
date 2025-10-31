import { Test, TestingModule } from '@nestjs/testing';
import { CreditService } from './credit.service';
import { PrismaService } from '../../config/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// mock prisma service
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

// mock data
const mockCreditRequest = { id: 1, userId: 1, amount: 1000, status: 'PENDING', createdAt: new Date() };
const mockApprovedCredit = { ...mockCreditRequest, status: 'APPROVED' };
const mockRejectedCredit = { ...mockCreditRequest, status: 'REJECTED' }; 


describe('CreditService', () => {
  let service: CreditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // provide the mock implementation
        },
      ],
    }).compile();

    service = module.get<CreditService>(CreditService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // clear mocks after each test to prevent bleed-through
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // unit tests for each method 
  describe('approveCredit', () => {
    it('should successfully approve a PENDING credit and update user balance', async () => {
      // mock methods
      mockPrismaService.credit.findUnique.mockResolvedValue(mockCreditRequest);
      mockPrismaService.credit.update.mockResolvedValue(mockApprovedCredit);
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

  describe('rejectCredit', () => {
    it('should successfully reject a PENDING credit', async () => {
      // mock methods
      mockPrismaService.credit.findUnique.mockResolvedValue(mockCreditRequest);
      mockPrismaService.credit.update.mockResolvedValue(mockRejectedCredit);
      
      const result = await service.rejectCredit(1);

      // Check results and side effects
      expect(result).toEqual(mockRejectedCredit);
      expect(mockPrismaService.credit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'REJECTED' },
      });
      // Important: Ensure user balance is NOT updated on rejection
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
    
    it('should return the credit if it is already REJECTED (no re-rejection)', async () => {
      mockPrismaService.credit.findUnique.mockResolvedValue(mockRejectedCredit);

      const result = await service.rejectCredit(1);

      expect(result).toEqual(mockRejectedCredit);
      expect(mockPrismaService.credit.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if credit does not exist', async () => {
      mockPrismaService.credit.findUnique.mockResolvedValue(null);

      await expect(service.rejectCredit(999)).rejects.toThrow(NotFoundException);
    });
  });
});