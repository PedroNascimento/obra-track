// =============================================================
// Entidade de domínio: User
// Sem exposição do passwordHash após criação
// =============================================================

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly _props: UserProps;

  private constructor(props: UserProps) {
    this._props = props;
  }

  // ─── Getters (passwordHash não exposto publicamente) ────────
  get id(): string { return this._props.id; }
  get name(): string { return this._props.name; }
  get email(): string { return this._props.email; }
  get createdAt(): Date { return this._props.createdAt; }
  get updatedAt(): Date { return this._props.updatedAt; }

  // Getter interno para uso no AuthService
  getPasswordHash(): string {
    return this._props.passwordHash;
  }

  // ─── Método de criação com validação ────────────────────────
  static create(props: Omit<UserProps, "createdAt" | "updatedAt"> & {
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    User.validate(props);
    const now = new Date();
    return new User({
      ...props,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  // ─── Reconstrução a partir do banco ─────────────────────────
  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // ─── Regras de negócio ──────────────────────────────────────
  private static validate(props: Omit<UserProps, "createdAt" | "updatedAt">): void {
    if (!props.name?.trim()) {
      throw new Error("O nome do usuário é obrigatório.");
    }

    if (props.name.trim().length < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres.");
    }

    if (!props.email?.trim()) {
      throw new Error("O e-mail do usuário é obrigatório.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email.trim())) {
      throw new Error("O e-mail informado é inválido.");
    }

    if (!props.passwordHash) {
      throw new Error("O hash da senha é obrigatório.");
    }
  }

  // ─── Serialização pública (sem senha) ───────────────────────
  toJSON(): Omit<UserProps, "passwordHash"> {
    const { passwordHash: _, ...rest } = this._props;
    return rest;
  }
}
