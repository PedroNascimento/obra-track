import { Category } from "../entities";

// =============================================================
// Contrato do repositório de categorias
// =============================================================

export interface ICategoryRepository {
  /** Cria uma nova categoria */
  create(category: Category): Promise<Category>;

  /** Busca categoria por ID, garantindo isolamento por userId */
  findById(id: string, userId: string): Promise<Category | null>;

  /** Lista todas as categorias de um usuário */
  findAllByUser(userId: string): Promise<Category[]>;

  /** Verifica se nome de categoria já existe para o usuário */
  nameExistsForUser(name: string, userId: string, excludeId?: string): Promise<boolean>;

  /** Atualiza uma categoria */
  update(category: Category): Promise<Category>;

  /** Remove uma categoria */
  delete(id: string, userId: string): Promise<void>;
}
