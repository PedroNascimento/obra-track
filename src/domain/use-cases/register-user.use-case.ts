import { randomUUID } from "crypto";
import { User } from "../entities";
import { IUserRepository } from "../repositories";

// =============================================================
// Use Case: Registrar Usuário
// O hash da senha é feito ANTES de chamar este use case
// (responsabilidade do AuthService na camada de application)
// =============================================================

export interface RegisterUserInput {
  name: string;
  email: string;
  passwordHash: string; // já hasheado com bcrypt
}

export interface RegisterUserOutput {
  user: User;
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Verifica se e-mail já está em uso
    const emailInUse = await this.userRepository.emailExists(input.email.toLowerCase().trim());

    if (emailInUse) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const user = User.create({
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
    });

    const created = await this.userRepository.create(user);

    return { user: created };
  }
}
