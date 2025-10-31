import { Test, TestingModule } from '@nestjs/testing';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service'; 


// Mock the CreditService methods that the controller calls
const mockCreditService = {
  requestCredit: jest.fn(),
  listPending: jest.fn(),
  approveCredit: jest.fn(),
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
});
