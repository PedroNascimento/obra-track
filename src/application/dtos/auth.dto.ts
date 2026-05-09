import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string("O nome é obrigatório.")
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  email: z
    .string("O e-mail é obrigatório.")
    .email("E-mail inválido.")
    .toLowerCase()
    .trim(),
  password: z
    .string("A senha é obrigatória.")
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."), // bcrypt limita a 72 bytes
});

export const loginSchema = z.object({
  email: z
    .string("O e-mail é obrigatório.")
    .email("E-mail inválido.")
    .toLowerCase()
    .trim(),
  password: z
    .string("A senha é obrigatória.")
    .min(1, "A senha é obrigatória."),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
