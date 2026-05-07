import { prisma } from "@/infrastructure/database/prisma.client";
import { Category } from "@/domain/entities";
import { ICategoryRepository } from "@/domain/repositories";
import { mapPrismaCategoryToDomain } from "./prisma-mapper";

// =============================================================
// Implementação concreta: ICategoryRepository com Prisma
// =============================================================

export class PrismaCategoryRepository implements ICategoryRepository {

  async create(category: Category): Promise<Category> {
    const record = await prisma.category.create({
      data: {
        id: category.id,
        userId: category.userId,
        name: category.name,
        color: category.color,
      },
    });
    return mapPrismaCategoryToDomain(record);
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const record = await prisma.category.findFirst({
      where: { id, userId },
    });
    return record ? mapPrismaCategoryToDomain(record) : null;
  }

  async findAllByUser(userId: string): Promise<Category[]> {
    const records = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return records.map(mapPrismaCategoryToDomain);
  }

  async nameExistsForUser(
    name: string,
    userId: string,
    excludeId?: string
  ): Promise<boolean> {
    const count = await prisma.category.count({
      where: {
        userId,
        name: { equals: name, mode: "insensitive" },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async update(category: Category): Promise<Category> {
    const record = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        color: category.color,
      },
    });
    return mapPrismaCategoryToDomain(record);
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.category.deleteMany({
      where: { id, userId },
    });
  }
}
