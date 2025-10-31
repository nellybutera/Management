import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Patch, Body, Delete } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';  


@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles('ADMIN')
    @ApiResponse({ status: 200, description: 'List all users (Admin only)' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles('ADMIN')
    @ApiResponse({ status: 200, description: 'Get a single user by ID (Admin only)' })
    findOne(@Param('id') id: string) {
        // Use +id to convert the string param to a number
        return this.usersService.findById(+id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    @ApiResponse({ status: 200, description: 'Update user (Admin only)' })
    update(
        @Param('id') id: string, 
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(+id, updateUserDto);
    }


    @Delete(':id')
    @Roles('ADMIN')
    @ApiResponse({ status: 200, description: 'Delete user (Admin only)' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

}
