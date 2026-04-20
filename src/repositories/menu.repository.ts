import type { Dish, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';

export interface DishListFilters {
  sectionId?: number;
  minWeight?: number;
  maxWeight?: number;
  minCalories?: number;
  maxCalories?: number;
  hasAllergens?: string | boolean;
  isSpicy?: string | boolean;
  kidFriendly?: string | boolean;
  q?: string;
}

function mapDishList(d: Dish) {
  return {
    id: d.id,
    sectionId: d.sectionId,
    name: d.name,
    description: d.description,
    imageUrl: d.imageUrl,
    weightG: d.weightG,
    calories: d.calories,
    hasAllergens: d.hasAllergens,
    isSpicy: d.isSpicy,
    kidFriendly: d.kidFriendly,
    createdAt: d.createdAt,
  };
}

export type DishDetail = ReturnType<typeof mapDishList> & {
  sectionName: string;
  ingredients: { id: number; name: string; sortOrder: number }[];
  reviews: {
    id: number;
    authorName: string;
    body: string;
    photoUrl: string | null;
    createdAt: Date;
  }[];
};

class MenuRepository {
  async listSections() {
    return prisma.menuSection.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, sortOrder: true },
    });
  }

  async findDishes(filters: DishListFilters) {
    const parts: Prisma.DishWhereInput[] = [];

    if (filters.sectionId != null) {
      parts.push({ sectionId: filters.sectionId });
    }
    if (filters.minWeight != null) {
      parts.push({ weightG: { gte: filters.minWeight } });
    }
    if (filters.maxWeight != null) {
      parts.push({ weightG: { lte: filters.maxWeight } });
    }
    if (filters.minCalories != null) {
      parts.push({ calories: { gte: filters.minCalories } });
    }
    if (filters.maxCalories != null) {
      parts.push({ calories: { lte: filters.maxCalories } });
    }
    if (filters.hasAllergens != null) {
      parts.push({
        hasAllergens: filters.hasAllergens === 'true' || filters.hasAllergens === true,
      });
    }
    if (filters.isSpicy != null) {
      parts.push({ isSpicy: filters.isSpicy === 'true' || filters.isSpicy === true });
    }
    if (filters.kidFriendly != null) {
      parts.push({ kidFriendly: filters.kidFriendly === 'true' || filters.kidFriendly === true });
    }
    if (filters.q) {
      parts.push({ name: { contains: filters.q, mode: 'insensitive' } });
    }

    const where: Prisma.DishWhereInput = parts.length ? { AND: parts } : {};

    const rows = await prisma.dish.findMany({
      where,
      orderBy: { id: 'asc' },
    });
    return rows.map(mapDishList);
  }

  async findDishById(id: number): Promise<DishDetail | null> {
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menuSection: { select: { name: true } },
        ingredients: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
        reviews: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] },
      },
    });
    if (!dish) return null;

    const base = mapDishList(dish);
    return {
      ...base,
      sectionName: dish.menuSection.name,
      ingredients: dish.ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        sortOrder: i.sortOrder,
      })),
      reviews: dish.reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        body: r.body,
        photoUrl: r.photoUrl,
        createdAt: r.createdAt,
      })),
    };
  }
}

export const menuRepository = new MenuRepository();
