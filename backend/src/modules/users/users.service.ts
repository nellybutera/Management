import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, balance: true } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // helper method to clear the RT hash for logout/security events
  async clearRtHash(userId: number) {
      await this.prisma.user.update({
          where: { id: userId },
          data: { refreshTokenHash: null },
      });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
