import type { Request, Response } from 'express';
import { menuRepository, type DishListFilters } from '../repositories/menu.repository.js';

export async function listSections(_req: Request, res: Response): Promise<void> {
  const rows = await menuRepository.listSections();
  res.json(rows);
}

export async function listDishes(req: Request, res: Response): Promise<void> {
  const q = req.query as DishListFilters;
  const rows = await menuRepository.findDishes(q);
  res.json(rows);
}

export async function getDishById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const dish = await menuRepository.findDishById(id);
  if (!dish) {
    res.status(404).json({ error: 'Dish not found' });
    return;
  }
  res.json(dish);
}
