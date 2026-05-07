import { User } from "../entities";
import { IUserRepository } from "../repositories";

// =============================================================
// Use Case: Login de Usuário
// A verificação de senha e geração do JWT são feitas pelo
// AuthService (camada de application) — este use case apenas
// valida credenciais e retorna o usuário autenticado
// =============================================================

export interface LoginUserInput {
  email: string;
  /** Senha em texto plano — comparada com hash pelo AuthService */
  plainPassword: string;
  /** Função injetada para comparar a senha (evita dependência de bcrypt aqui) */
  comparePassword: (plain: string, hash: string) => Promise<boolean>;
}

export interface LoginUserOutput {
  user: User;
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(
      input.email.toLowerCase().trim()
    );

    if (!user) {
      // Mensagem genérica para não revelar se o e-mail existe
      throw new Error("Credenciais inválidas.");
    }

    const passwordMatch = await input.comparePassword(
      input.plainPassword,
      user.getPasswordHash()
    );

    if (!passwordMatch) {
      throw new Error("Credenciais inválidas.");
    }

    return { user };
  }
}
