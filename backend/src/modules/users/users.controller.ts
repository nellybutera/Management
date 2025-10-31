import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles('ADMIN')
  all() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'CUSTOMER')
  byId(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }
}
