import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { User } from 'src/auth/user.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { PaginatedResult } from './pagination.interface';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { BudgetsService } from 'src/budgets/budgets.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private categoriesService: CategoriesService,
    @Inject(forwardRef(() => BudgetsService))
    private budgetsService: BudgetsService,
  ) {}

  async createExpense(
    createExpenseDto: CreateExpenseDto,
    user: User,
  ): Promise<Expense> {
    const { categoryId } = createExpenseDto;

    // Validate that the category exists and user has access to it
    if (categoryId) {
      await this.categoriesService.getCategoryById(categoryId, user);
    }

    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      userId: user?.id,
    });
    const saved = await this.expensesRepository.save(expense);

    // update budget spent for this category/month
    await this.budgetsService.updateBudgetSpent(
      saved.userId,
      saved.categoryId,
      saved.date,
    );

    return saved;
  }

  async getExpenses(
    filterExpenseDto: FilterExpenseDto,
    user: User,
  ): Promise<PaginatedResult<Expense>> {
    const {
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 10,
    } = filterExpenseDto;

    const queryBuilder = this.expensesRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.userId = :userId', { userId: user?.id });

    //   Apply Filters Starts Here
    if (categoryId) {
      queryBuilder.andWhere('expense.categoryId = :categoryId', { categoryId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('expense.date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('expense.date <= :endDate', { endDate });
    }

    if (minAmount) {
      queryBuilder.andWhere('expense.amount >= :minAmount', { minAmount });
    }

    if (maxAmount) {
      queryBuilder.andWhere('expense.amount <= :maxAmount', { maxAmount });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(expense.description) LIKE LOWER(:search))',
        {
          search: `%${search}%`,
        },
      );
    }
    // Apply Filters Ends Here

    queryBuilder
      .orderBy('expense.date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastpage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async getExpenseById(id: string, user: User): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id, userId: user?.id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }

    if (expense?.userId !== user?.id) {
      throw new NotFoundException(`access denied`);
    }

    return expense;
  }

  async updateExpenseById(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    user: User,
  ): Promise<Expense> {
    const { categoryId } = updateExpenseDto;

    // Validate that the category exists and get the category object
    let newCategory: Awaited<
      ReturnType<typeof this.categoriesService.getCategoryById>
    > | null = null;
    if (categoryId) {
      newCategory = await this.categoriesService.getCategoryById(
        categoryId,
        user,
      );
    }

    const expense = await this.getExpenseById(id, user);

    const oldCategoryId = expense.categoryId;
    const oldDate = expense.date;

    // Update only the scalar fields from DTO (excluding categoryId which we handle via relation)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId: _categoryId, ...scalarFields } = updateExpenseDto;
    Object.assign(expense, scalarFields);

    // If categoryId was provided, update both the relation and the foreign key
    if (newCategory && categoryId) {
      expense.category = newCategory;
      expense.categoryId = categoryId;
    }

    const saved = await this.expensesRepository.save(expense);

    // update old budget bucket
    await this.budgetsService.updateBudgetSpent(
      saved.userId,
      oldCategoryId,
      oldDate,
    );

    // update new budget bucket
    await this.budgetsService.updateBudgetSpent(
      saved.userId,
      saved.categoryId,
      saved.date,
    );

    // Reload the expense with the updated category relation
    const updatedExpense = await this.expensesRepository.findOne({
      where: { id: saved.id },
      relations: ['category'],
    });

    return updatedExpense!;
  }

  async deleteExpenseById(id: string, user: User): Promise<string> {
    const expense = await this.getExpenseById(id, user);
    const oldCategoryId = expense.categoryId;
    const oldDate = expense.date;

    if (expense?.userId !== user?.id) {
      throw new NotFoundException(`access denied`);
    }

    const result = await this.expensesRepository.delete({
      id,
      userId: user?.id,
    });

    if (result?.affected === 0) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }

    // after deletion, recalc spent for that bucket
    await this.budgetsService.updateBudgetSpent(
      user.id,
      oldCategoryId,
      oldDate,
    );

    return 'Expense deleted successfully';
  }
}
