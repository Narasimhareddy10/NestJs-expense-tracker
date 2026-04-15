import { forwardRef, Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { BudgetsModule } from 'src/budgets/budgets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    AuthModule,
    CategoriesModule,
    forwardRef(() => BudgetsModule),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
