import { ExpenseType } from "../types";

// =============================================================
// Entidade de domínio: Expense
// Regras de negócio puras — sem dependências externas
// =============================================================

export interface ExpenseProps {
  id: string;
  userId: string;
  type: ExpenseType;
  categoryId?: string | null;
  description: string;
  amount: number;
  expenseDate: Date;
  createdAt: Date;
}

export class Expense {
  private readonly _props: ExpenseProps;

  private constructor(props: ExpenseProps) {
    this._props = props;
  }

  // ─── Getters ────────────────────────────────────────────────
  get id(): string { return this._props.id; }
  get userId(): string { return this._props.userId; }
  get type(): ExpenseType { return this._props.type; }
  get categoryId(): string | null | undefined { return this._props.categoryId; }
  get description(): string { return this._props.description; }
  get amount(): number { return this._props.amount; }
  get expenseDate(): Date { return this._props.expenseDate; }
  get createdAt(): Date { return this._props.createdAt; }

  // ─── Método de criação com validação ────────────────────────
  static create(props: Omit<ExpenseProps, "id" | "createdAt"> & { id?: string, createdAt?: Date }): Expense {
    Expense.validate(props as any);
    return new Expense({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: props.createdAt ?? new Date(),
    } as ExpenseProps);
  }

  // ─── Reconstrução a partir do banco (sem re-validar) ────────
  static reconstitute(props: ExpenseProps): Expense {
    return new Expense(props);
  }

  // ─── Regras de negócio ──────────────────────────────────────
  private static validate(props: Omit<ExpenseProps, "createdAt"> & { createdAt?: Date }): void {
    if (!props.userId?.trim()) {
      throw new Error("Despesa deve estar associada a um usuário.");
    }

    if (props.amount <= 0) {
      throw new Error("O valor da despesa deve ser maior que zero.");
    }

    if (!Number.isFinite(props.amount)) {
      throw new Error("O valor da despesa é inválido.");
    }

    if (!props.description?.trim()) {
      throw new Error("A descrição da despesa é obrigatória.");
    }

    if (props.description.trim().length > 255) {
      throw new Error("A descrição deve ter no máximo 255 caracteres.");
    }

    if (!(props.expenseDate instanceof Date) || isNaN(props.expenseDate.getTime())) {
      throw new Error("A data da despesa é inválida.");
    }

    const validTypes: ExpenseType[] = [
      "material", "pedreiro", "servente",
      "alimentacao", "combustivel", "outro",
    ];
    if (!validTypes.includes(props.type)) {
      throw new Error(`Tipo de despesa inválido: ${props.type}`);
    }
  }

  // ─── Serialização ───────────────────────────────────────────
  toJSON(): ExpenseProps {
    return { ...this._props };
  }
}
