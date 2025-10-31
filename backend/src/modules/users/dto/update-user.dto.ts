// src/modules/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
  })
  name?: string;

  @ApiProperty({
    example: 'user@example.com',
  })
  email?: string;


  @ApiProperty({
    example: 'ADMIN',
    enum: ['USER', 'ADMIN'],
  })
  role?: 'USER' | 'ADMIN';
}