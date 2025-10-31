import { Test, TestingModule } from '@nestjs/testing';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service'; 


// Mock the CreditService methods that the controller calls
const mockCreditService = {
  listPending: jest.fn(),
  approveCredit: jest.fn(),
  rejectCredit: jest.fn(),
};

describe('CreditController', () => {
  let controller: CreditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditController],
      providers: [
        // CRITICAL: Provide the mock for the required dependency (CreditService)
        {
          provide: CreditService,
          useValue: mockCreditService,
        },
      ],
    }).compile();

    controller = module.get<CreditController>(CreditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // test for the new reject endpoint
  it('should call rejectCredit service method', async () => {
    const creditId = '2';
    mockCreditService.rejectCredit.mockResolvedValue({});
    
    await controller.reject(creditId);
    
    expect(mockCreditService.rejectCredit).toHaveBeenCalledWith(Number(creditId));
  });

  // test for the approve endpoint (Optional, but good practice)
  it('should call approveCredit service method', async () => {
    const creditId = '1';
    mockCreditService.approveCredit.mockResolvedValue({});
    
    await controller.approve(creditId);
    
    expect(mockCreditService.approveCredit).toHaveBeenCalledWith(Number(creditId));
  });
});
