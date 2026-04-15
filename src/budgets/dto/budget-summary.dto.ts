import { Budget } from '../budget.entity';

export type BudgetSummary = Budget & {
  percentage: string;
  remaining: string;
  status: string;
};
