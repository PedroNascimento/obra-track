import { Expense } from "../entities";
import { IExpenseRepository } from "../repositories";
import { ExpenseFilter } from "../types";

// =============================================================
// Use Case: Listar Despesas com Filtro
// =============================================================

export interface GetExpensesInput {
  userId: string;
  filter: ExpenseFilter;
  page?: number;
  pageSize?: number;
}

export interface GetExpensesOutput {
  expenses: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class GetExpensesUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(input: GetExpensesInput): Promise<GetExpensesOutput> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const [expenses, total] = await Promise.all([
      this.expenseRepository.findByFilter(input.userId, input.filter, {
        skip,
        take: pageSize,
      }),
      this.expenseRepository.countByFilter(input.userId, input.filter),
    ]);

    return {
      expenses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
