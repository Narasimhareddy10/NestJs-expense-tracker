import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BudgetsService } from './budgets.service';
import { BudgetSummary } from './dto/budget-summary.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { getUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Budget } from './budget.entity';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(AuthGuard())
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post()
  createBudget(
    @Body() createBudgetDto: CreateBudgetDto,
    @getUser() user: User,
  ): Promise<Budget> {
    return this.budgetsService.createBudget(createBudgetDto, user);
  }

  @Get()
  getBudgets(@getUser() user: User): Promise<BudgetSummary[]> {
    return this.budgetsService.getBudgets(user);
  }

  @Get(':id')
  getBudgetById(
    @Param('id') id: string,
    @getUser() user: User,
  ): Promise<Budget> {
    return this.budgetsService.getBudgetById(id, user);
  }

  @Patch(':id/update')
  updateBudgetById(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @getUser() user: User,
  ): Promise<Budget> {
    return this.budgetsService.updateBudgetById(id, updateBudgetDto, user);
  }

  @Delete(':id/delete')
  deleteBudget(
    @Param('id') id: string,
    @getUser() user: User,
  ): Promise<string> {
    return this.budgetsService.deleteBudgetById(id, user);
  }
}
