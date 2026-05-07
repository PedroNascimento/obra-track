import { IExpenseRepository } from "../repositories";

// =============================================================
// Use Case: Deletar Despesa
// =============================================================

export interface DeleteExpenseInput {
  id: string;
  userId: string; // garante que só o dono pode deletar
}

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(input: DeleteExpenseInput): Promise<void> {
    const existing = await this.expenseRepository.findById(input.id, input.userId);

    if (!existing) {
      throw new Error("Despesa não encontrada ou sem permissão para deletar.");
    }

    await this.expenseRepository.delete(input.id, input.userId);
  }
}
