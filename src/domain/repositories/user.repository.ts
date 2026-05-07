import { User } from "../entities";

// =============================================================
// Contrato do repositório de usuários
// =============================================================

export interface IUserRepository {
  /** Cria um novo usuário */
  create(user: User): Promise<User>;

  /** Busca usuário por ID */
  findById(id: string): Promise<User | null>;

  /** Busca usuário por e-mail (para autenticação) */
  findByEmail(email: string): Promise<User | null>;

  /** Verifica se e-mail já está em uso */
  emailExists(email: string): Promise<boolean>;

  /** Atualiza dados do usuário */
  update(user: User): Promise<User>;
}
