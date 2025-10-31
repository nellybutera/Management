import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: 'Monthly savings deposit' })
  description: string;
}
