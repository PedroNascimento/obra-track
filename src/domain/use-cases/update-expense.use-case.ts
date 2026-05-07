import { Expense } from "../entities";
import { IExpenseRepository } from "../repositories";
import { ExpenseType } from "../types";

// =============================================================
// Use Case: Atualizar Despesa
// =============================================================

export interface UpdateExpenseInput {
  id: string;
  userId: string; // garante que só o dono pode editar
  type?: ExpenseType;
  categoryId?: string | null;
  description?: string;
  amount?: number;
  expenseDate?: Date;
}

export interface UpdateExpenseOutput {
  expense: Expense;
}

export class UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(input: UpdateExpenseInput): Promise<UpdateExpenseOutput> {
    const existing = await this.expenseRepository.findById(input.id, input.userId);

    if (!existing) {
      throw new Error("Despesa não encontrada ou sem permissão para editar.");
    }

    // Reconstrói a entidade com os campos atualizados
    const updated = Expense.create({
      id: existing.id,
      userId: existing.userId,
      type: input.type ?? existing.type,
      categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
      description: input.description ?? existing.description,
      amount: input.amount ?? existing.amount,
      expenseDate: input.expenseDate ?? existing.expenseDate,
      createdAt: existing.createdAt,
    });

    const saved = await this.expenseRepository.update(updated);

    return { expense: saved };
  }
}
