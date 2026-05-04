import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../database/entities/dish.entity';
import { MenuSection } from '../database/entities/menu-section.entity';
import { Review } from '../database/entities/review.entity';
import type { CreateReviewDto } from './dto/create-review.dto';
import type { ListDishesQueryDto } from './dto/list-dishes-query.dto';

function mapDishList(dish: Dish) {
  return {
    id: dish.id,
    sectionId: dish.sectionId,
    name: dish.name,
    description: dish.description,
    imageUrl: dish.imageUrl,
    weightG: dish.weightG,
    calories: dish.calories,
    hasAllergens: dish.hasAllergens,
    isSpicy: dish.isSpicy,
    kidFriendly: dish.kidFriendly,
    createdAt: dish.createdAt,
  };
}

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuSection)
    private readonly sectionRepo: Repository<MenuSection>,
    @InjectRepository(Dish)
    private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  listSections() {
    return this.sectionRepo.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
      select: { id: true, name: true, sortOrder: true },
    });
  }

  findDishes(filters: ListDishesQueryDto) {
    if (
      filters.minWeight != null &&
      filters.maxWeight != null &&
      filters.minWeight > filters.maxWeight
    ) {
      throw new BadRequestException({
        errors: [
          {
            type: 'field',
            path: 'query',
            msg: 'minWeight must be less than or equal to maxWeight',
          },
        ],
      });
    }
    if (
      filters.minCalories != null &&
      filters.maxCalories != null &&
      filters.minCalories > filters.maxCalories
    ) {
      throw new BadRequestException({
        errors: [
          {
            type: 'field',
            path: 'query',
            msg: 'minCalories must be less than or equal to maxCalories',
          },
        ],
      });
    }
    const qb = this.dishRepo.createQueryBuilder('dish');
    if (filters.sectionId != null) {
      qb.andWhere('dish.sectionId = :sectionId', { sectionId: filters.sectionId });
    }
    if (filters.minWeight != null) {
      qb.andWhere('dish.weightG >= :minWeight', { minWeight: filters.minWeight });
    }
    if (filters.maxWeight != null) {
      qb.andWhere('dish.weightG <= :maxWeight', { maxWeight: filters.maxWeight });
    }
    if (filters.minCalories != null) {
      qb.andWhere('dish.calories >= :minCalories', { minCalories: filters.minCalories });
    }
    if (filters.maxCalories != null) {
      qb.andWhere('dish.calories <= :maxCalories', { maxCalories: filters.maxCalories });
    }
    if (filters.hasAllergens != null) {
      qb.andWhere('dish.hasAllergens = :ha', { ha: filters.hasAllergens === 'true' });
    }
    if (filters.isSpicy != null) {
      qb.andWhere('dish.isSpicy = :sp', { sp: filters.isSpicy === 'true' });
    }
    if (filters.kidFriendly != null) {
      qb.andWhere('dish.kidFriendly = :kf', { kf: filters.kidFriendly === 'true' });
    }
    if (filters.q) {
      qb.andWhere('dish.name ILIKE :q', { q: `%${filters.q}%` });
    }
    qb.orderBy('dish.id', 'ASC');
    return qb.getMany().then((dishes) => dishes.map(mapDishList));
  }

  async findDishById(id: number) {
    const dish = await this.dishRepo.findOne({
      where: { id },
      relations: { menuSection: true, ingredients: true, reviews: true },
    });
    if (!dish) {
      throw new NotFoundException({ error: 'Dish not found' });
    }
    dish.ingredients.sort(
      (ingredientA, ingredientB) =>
        ingredientA.sortOrder - ingredientB.sortOrder || ingredientA.id - ingredientB.id,
    );
    dish.reviews.sort(
      (reviewA, reviewB) =>
        reviewB.createdAt.getTime() - reviewA.createdAt.getTime() || reviewB.id - reviewA.id,
    );
    const base = mapDishList(dish);
    return {
      ...base,
      sectionName: dish.menuSection.name,
      ingredients: dish.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        sortOrder: ingredient.sortOrder,
      })),
      reviews: dish.reviews.map((review) => ({
        id: review.id,
        authorName: review.authorName,
        body: review.body,
        photoUrl: review.photoUrl,
        createdAt: review.createdAt,
      })),
    };
  }

  async createReview(dishId: number, dto: CreateReviewDto) {
    const dishExists = await this.dishRepo.exist({ where: { id: dishId } });
    if (!dishExists) {
      throw new NotFoundException({ error: 'Dish not found' });
    }
    const authorName = dto.authorName.trim();
    const body = dto.body.trim();
    if (!authorName || !body) {
      throw new BadRequestException({
        errors: [
          ...(!authorName
            ? [{ type: 'field' as const, path: 'authorName', msg: 'must not be empty' }]
            : []),
          ...(!body ? [{ type: 'field' as const, path: 'body', msg: 'must not be empty' }] : []),
        ],
      });
    }
    const photoUrl =
      dto.photoUrl != null && String(dto.photoUrl).trim() !== '' ? dto.photoUrl.trim() : null;
    const review = this.reviewRepo.create({
      dishId,
      authorName,
      body,
      photoUrl,
    });
    const saved = await this.reviewRepo.save(review);
    return {
      id: saved.id,
      dishId: saved.dishId,
      authorName: saved.authorName,
      body: saved.body,
      photoUrl: saved.photoUrl,
      createdAt: saved.createdAt,
    };
  }
}
