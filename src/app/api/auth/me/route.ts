import { NextRequest } from "next/server";
import { makeContainer } from "@/lib/container";
import { ok, unauthorized, handleApiError } from "@/lib/api";

// GET /api/auth/me — retorna o usuário autenticado (lido do header injetado pelo middleware)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return unauthorized();

    const { userRepository } = makeContainer();
    const user = await userRepository.findById(userId);
    if (!user) return unauthorized();

    return ok({ user: user.toJSON() });
  } catch (error) {
    return handleApiError(error);
  }
}
