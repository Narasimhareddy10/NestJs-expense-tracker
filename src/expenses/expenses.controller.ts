import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { getUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Expense } from './expense.entity';
import { ExpensesService } from './expenses.service';
import { PaginatedResult } from './pagination.interface';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Controller('expenses')
@UseGuards(AuthGuard())
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  createExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @getUser() user: User,
  ): Promise<Expense> {
    return this.expensesService.createExpense(createExpenseDto, user);
  }

  @Get()
  getExpenses(
    @Query() filterExpenseDto: FilterExpenseDto,
    @getUser() user: User,
  ): Promise<PaginatedResult<Expense>> {
    return this.expensesService.getExpenses(filterExpenseDto, user);
  }

  @Get(':id')
  getExpenseById(
    @Param('id') id: string,
    @getUser() user: User,
  ): Promise<Expense> {
    return this.expensesService.getExpenseById(id, user);
  }

  @Patch(':id/update')
  updateExpense(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @getUser() user: User,
  ): Promise<Expense> {
    return this.expensesService.updateExpenseById(id, updateExpenseDto, user);
  }

  @Delete(':id/delete')
  deleteExpense(
    @Param('id') id: string,
    @getUser() user: User,
  ): Promise<string> {
    return this.expensesService.deleteExpenseById(id, user);
  }
}
