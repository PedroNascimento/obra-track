import { FinancialSummary, IExpenseRepository } from "../repositories";
import { ExpenseFilter } from "../types";

// =============================================================
// Use Case: Obter Resumo Financeiro para o Dashboard
// =============================================================

export interface GetFinancialSummaryInput {
  userId: string;
  filter: ExpenseFilter;
}

export interface GetFinancialSummaryOutput {
  summary: FinancialSummary;
}

export class GetFinancialSummaryUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(input: GetFinancialSummaryInput): Promise<GetFinancialSummaryOutput> {
    const summary = await this.expenseRepository.getSummary(
      input.userId,
      input.filter
    );

    return { summary };
  }
}
