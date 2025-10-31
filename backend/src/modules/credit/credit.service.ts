import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async requestCredit(userId: number, amount: number) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');
    return this.prisma.credit.create({ data: { userId, amount } });
  }

  async approveCredit(creditId: number) {
    const credit = await this.prisma.credit.findUnique({ where: { id: creditId } });
    if (!credit) throw new NotFoundException('Credit not found');
    if (credit.status === 'APPROVED') return credit;
    const updated = await this.prisma.credit.update({ where: { id: creditId }, data: { status: 'APPROVED' } });
    // optional: increment user balance on approval
    await this.prisma.user.update({ where: { id: credit.userId }, data: { balance: { increment: credit.amount } } });
    return updated;
  }

  async listPending() {
    return this.prisma.credit.findMany({ where: { status: 'PENDING' }, include: { user: true } });
  }
}
