import { NextRequest } from "next/server";
import { registerSchema } from "@/application/dtos/auth.dto";
import { hashPassword, signJWT, AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/application/services/auth.service";
import { makeContainer } from "@/lib/container";
import { created, handleApiError, conflict } from "@/lib/api";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = registerSchema.parse(body);

    const { registerUser } = makeContainer();

    const passwordHash = await hashPassword(dto.password);
    const { user } = await registerUser.execute({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    // Gera JWT e define cookie imediatamente após registro
    const token = await signJWT({ sub: user.id, email: user.email, name: user.name });
    
    const response = created({ user: user.toJSON() });
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("já está cadastrado")) {
      return conflict(error.message);
    }
    return handleApiError(error);
  }
}
