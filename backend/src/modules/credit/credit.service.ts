import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Credit } from '@prisma/client';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async approveCredit(creditId: number): Promise<Credit> {
    const credit = await this.prisma.credit.findUnique({ where: { id: creditId } });
    if (!credit) throw new NotFoundException('Credit not found');
    if (credit.status === 'APPROVED') return credit; // Idempotency
    if (credit.status === 'REJECTED') throw new BadRequestException('Cannot approve a rejected credit request.');
      
    const updated = await this.prisma.credit.update({ where: { id: creditId }, data: { status: 'APPROVED' } });
    // Update user balance on approval
    await this.prisma.user.update({ 
          where: { id: credit.userId }, 
          data: { balance: { increment: credit.amount } } 
      });
      return updated;
    }

  async rejectCredit(creditId: number): Promise<Credit> {
    const credit = await this.prisma.credit.findUnique({ where: { id: creditId } });
    if (!credit) throw new NotFoundException('Credit not found');
    if (credit.status === 'REJECTED') return credit; // Idempotency
      
    const updated = await this.prisma.credit.update({ 
          where: { id: creditId }, 
          data: { status: 'REJECTED' } 
      });
      return updated;
    }

    async listPending() {
      return this.prisma.credit.findMany({ where: { status: 'PENDING' }, include: { user: true } });
    }

}
