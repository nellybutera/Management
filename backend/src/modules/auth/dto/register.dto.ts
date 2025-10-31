import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  password: string;

  @ApiProperty({ example: 'CUSTOMER', enum: ['CUSTOMER', 'ADMIN'] })
  role?: 'CUSTOMER' | 'ADMIN';
}
