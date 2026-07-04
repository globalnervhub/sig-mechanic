import { IsEnum } from 'class-validator';
import { BudgetStatus } from '@prisma/client';

export class UpdateBudgetStatusDto {
  @IsEnum(BudgetStatus)
  status!: BudgetStatus;
}
