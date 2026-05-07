import { prisma } from "@/infrastructure/database/prisma.client";
import { User } from "@/domain/entities";
import { IUserRepository } from "@/domain/repositories";
import { mapPrismaUserToDomain } from "./prisma-mapper";

// =============================================================
// Implementação concreta: IUserRepository com Prisma
// =============================================================

export class PrismaUserRepository implements IUserRepository {

  async create(user: User): Promise<User> {
    const record = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.getPasswordHash(),
      },
    });
    return mapPrismaUserToDomain(record);
  }

  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { id },
    });
    return record ? mapPrismaUserToDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return record ? mapPrismaUserToDomain(record) : null;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email: email.toLowerCase().trim() },
    });
    return count > 0;
  }

  async update(user: User): Promise<User> {
    const record = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
      },
    });
    return mapPrismaUserToDomain(record);
  }
}
