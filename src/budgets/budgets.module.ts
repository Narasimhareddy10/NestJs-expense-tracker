import { forwardRef, Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { Expense } from 'src/expenses/expense.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ExpensesModule } from 'src/expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, Expense]),
    AuthModule,
    forwardRef(() => ExpensesModule),
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
