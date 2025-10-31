import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { CreditService } from './credit.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Credit')
@Controller('credit')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditController {
  constructor(private service: CreditService) {}

  @Post('approve/:id')
  @Roles('ADMIN')
  approve(@Param('id') id: string) {
    return this.service.approveCredit(Number(id));
  }

  @Get('pending')
  @Roles('ADMIN')
  pending() {
    return this.service.listPending();
  }

  @Post('reject/:id')
  @Roles('ADMIN')
  reject(@Param('id') id: string) {
    return this.service.rejectCredit(Number(id)); 
  }


}