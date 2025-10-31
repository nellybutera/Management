import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CreditService } from './credit.service';

@Controller('credit')
export class CreditController {
  constructor(private service: CreditService) {}

  @Post('request')
  request(@Body() body: { userId: number; amount: number }) {
    return this.service.requestCredit(body.userId, body.amount);
  }

  @Post('approve/:id')
  approve(@Param('id') id: string) {
    return this.service.approveCredit(Number(id));
  }

  @Get('pending')
  pending() {
    return this.service.listPending();
  }
}
