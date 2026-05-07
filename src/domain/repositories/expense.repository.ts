import { Expense } from "../entities";
import { ExpenseFilter, ExpenseType } from "../types";

// =============================================================
// Contrato do repositório de despesas
// A implementação concreta fica em infrastructure/repositories
// =============================================================

export interface ExpenseSummaryByType {
  type: ExpenseType;
  total: number;
  count: number;
}

export interface ExpenseSummaryByCategory {
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  total: number;
  count: number;
}

export interface TimelineEntry {
  date: string; // formato: "YYYY-MM-DD"
  total: number;
}

export interface FinancialSummary {
  totalAmount: number;
  totalCount: number;
  byType: ExpenseSummaryByType[];
  byCategory: ExpenseSummaryByCategory[];
  timeline: TimelineEntry[];
  periodLabel: string;
}

export interface IExpenseRepository {
  /** Persiste uma nova despesa */
  create(expense: Expense): Promise<Expense>;

  /** Busca despesa por ID, garantindo isolamento por userId */
  findById(id: string, userId: string): Promise<Expense | null>;

  /** Lista despesas de um usuário com filtro de período e tipo */
  findByFilter(
    userId: string,
    filter: ExpenseFilter,
    options?: { skip?: number; take?: number }
  ): Promise<Expense[]>;

  /** Conta total de despesas com filtro (para paginação) */
  countByFilter(userId: string, filter: ExpenseFilter): Promise<number>;

  /** Atualiza uma despesa existente */
  update(expense: Expense): Promise<Expense>;

  /** Remove uma despesa, garantindo que pertence ao userId */
  delete(id: string, userId: string): Promise<void>;

  /** Retorna resumo financeiro agregado para o dashboard */
  getSummary(userId: string, filter: ExpenseFilter): Promise<FinancialSummary>;
}
