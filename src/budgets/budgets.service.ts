import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Budget } from './budget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from 'src/expenses/expense.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { BudgetSummary } from './dto/budget-summary.dto';
import { User } from 'src/auth/user.entity';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async createBudget(createBudgetDto: CreateBudgetDto, user: User) {
    const { categoryId, month, year } = createBudgetDto;

    const existsingBudget = await this.budgetsRepository.findOne({
      where: {
        userId: user?.id,
        categoryId,
        month,
        year,
      },
    });

    if (existsingBudget) {
      throw new ConflictException(
        'Budget for this category and month already exists',
      );
    }

    const spent = await this.calculateSpent(user?.id, categoryId, month, year);

    const budget = this.budgetsRepository.create({
      ...createBudgetDto,
      spent,
      userId: user?.id,
    });

    return this.budgetsRepository.save(budget);
  }

  async getBudgets(user: User): Promise<BudgetSummary[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const budgets = await this.budgetsRepository.find({
      where: { userId: user?.id, month, year },
    });

    const results = budgets.map((budget) => ({
      ...budget,
      percentage: ((+budget.spent / +budget.limit) * 100).toFixed(1),
      remaining: (+budget.limit - +budget.spent).toFixed(2),
      status: this.getBudgetStatus(+budget.spent, +budget.limit),
    }));

    return results;
  }

  async getBudgetById(id: string, user: User): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id, userId: user?.id },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with id ${id} not found`);
    }

    return budget;
  }

  async updateBudgetById(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
    user: User,
  ): Promise<Budget> {
    const budget = await this.getBudgetById(id, user);
    Object.assign(budget, updateBudgetDto);

    return this.budgetsRepository.save(budget);
  }

  async deleteBudgetById(id: string, user: User): Promise<string> {
    await this.getBudgetById(id, user);
    const result = await this.budgetsRepository.delete({
      id,
      userId: user?.id,
    });

    if (result?.affected === 0) {
      throw new NotFoundException(`Budget with id ${id} not found`);
    }

    return 'Budget deleted successfully';
  }

  private async calculateSpent(
    userId: string,
    categoryId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const result = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.categoryId = :categoryId', { categoryId })
      .andWhere('EXTRACT(MONTH FROM expense.date) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM expense.date) = :year', { year })
      .getRawOne<{ total: string | null }>();

    const total = result?.total;

    return total ? Number.parseFloat(total) : 0;
  }

  private getBudgetStatus(spent: number, limit: number): string {
    const percentage = (spent / limit) * 100;

    if (percentage >= 100) {
      return 'Exceeded';
    } else if (percentage >= 80) {
      return 'Warning';
    } else {
      return 'On_Track';
    }
  }

  // Update budget spent when expense created/updated/deleted
  async updateBudgetSpent(
    userId: string,
    categoryId: string,
    date: Date | string,
  ): Promise<void> {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();

    const budget = await this.budgetsRepository.findOne({
      where: { userId, categoryId, month, year },
    });

    if (budget) {
      const spent = await this.calculateSpent(userId, categoryId, month, year);
      budget.spent = spent;

      const percentage = (spent / +budget.limit) * 100;
      if (percentage >= 80 && !budget.alertSent80) {
        budget.alertSent80 = true;
      }
      if (percentage >= 100 && !budget.alertSent100) {
        budget.alertSent100 = true;
      }

      await this.budgetsRepository.save(budget);
    }
  }
}
