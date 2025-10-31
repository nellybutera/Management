import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, balance: true } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}