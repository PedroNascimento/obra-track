// =============================================================
// Entidade de domínio: Category
// =============================================================

export interface CategoryProps {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export class Category {
  private readonly _props: CategoryProps;

  private constructor(props: CategoryProps) {
    this._props = props;
  }

  // ─── Getters ────────────────────────────────────────────────
  get id(): string { return this._props.id; }
  get userId(): string { return this._props.userId; }
  get name(): string { return this._props.name; }
  get color(): string { return this._props.color; }
  get createdAt(): Date { return this._props.createdAt; }

  // ─── Método de criação com validação ────────────────────────
  static create(props: Omit<CategoryProps, "createdAt"> & { createdAt?: Date }): Category {
    Category.validate(props);
    return new Category({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  // ─── Reconstrução a partir do banco ─────────────────────────
  static reconstitute(props: CategoryProps): Category {
    return new Category(props);
  }

  // ─── Regras de negócio ──────────────────────────────────────
  private static validate(props: Omit<CategoryProps, "createdAt">): void {
    if (!props.name?.trim()) {
      throw new Error("O nome da categoria é obrigatório.");
    }

    if (props.name.trim().length < 2) {
      throw new Error("O nome da categoria deve ter pelo menos 2 caracteres.");
    }

    if (props.name.trim().length > 50) {
      throw new Error("O nome da categoria deve ter no máximo 50 caracteres.");
    }

    if (!props.color?.trim()) {
      throw new Error("A cor da categoria é obrigatória.");
    }

    // Valida formato hex (#RGB ou #RRGGBB)
    const hexColorRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
    if (!hexColorRegex.test(props.color)) {
      throw new Error("A cor deve estar no formato hexadecimal (ex: #f97316).");
    }
  }

  // ─── Serialização ───────────────────────────────────────────
  toJSON(): CategoryProps {
    return { ...this._props };
  }
}
