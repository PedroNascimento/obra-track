import { randomUUID } from "crypto";
import { Expense } from "../entities";
import { IExpenseRepository } from "../repositories";
import { ExpenseType } from "../types";

// =============================================================
// Use Case: Criar Despesa
// =============================================================

export interface CreateExpenseInput {
  userId: string;
  type: ExpenseType;
  categoryId?: string | null;
  description: string;
  amount: number;
  expenseDate: Date;
}

export interface CreateExpenseOutput {
  expense: Expense;
}

export class CreateExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(input: CreateExpenseInput): Promise<CreateExpenseOutput> {
    const expense = Expense.create({
      id: randomUUID(),
      userId: input.userId,
      type: input.type,
      categoryId: input.categoryId ?? null,
      description: input.description,
      amount: input.amount,
      expenseDate: input.expenseDate,
    });

    const created = await this.expenseRepository.create(expense);

    return { expense: created };
  }
}
