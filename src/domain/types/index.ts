// =============================================================
// Tipos compartilhados entre todas as camadas da aplicação
// =============================================================

// Enum de tipos de despesa (espelhando o Prisma enum)
export type ExpenseType =
  | "material"
  | "pedreiro"
  | "servente"
  | "alimentacao"
  | "combustivel"
  | "outro";

// Labels em português para exibição na UI
export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  material: "Material",
  pedreiro: "Pedreiro",
  servente: "Servente",
  alimentacao: "Alimentação",
  combustivel: "Combustível",
  outro: "Outro",
};

// Cores padrão por tipo (para gráficos e badges)
export const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
  material: "#f97316",   // orange-500
  pedreiro: "#3b82f6",   // blue-500
  servente: "#8b5cf6",   // violet-500
  alimentacao: "#22c55e", // green-500
  combustivel: "#eab308", // yellow-500
  outro: "#6b7280",      // gray-500
};

// Tipo de filtro de período
export type PeriodFilter = "weekly" | "monthly" | "total" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ExpenseFilter {
  period: PeriodFilter;
  dateRange?: DateRange;
}

// Resultado de erro padronizado para API
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
