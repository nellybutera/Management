import { ApiProperty } from '@nestjs/swagger';

export class CreditRequestDto {
  @ApiProperty({ example: 200000 })
  amount: number;

  @ApiProperty({ example: '6 months' })
  duration: string;

  @ApiProperty({ example: 'Short-term emergency loan' })
  purpose: string;
}
