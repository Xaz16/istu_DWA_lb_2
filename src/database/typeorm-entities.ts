import { Booking } from './entities/booking.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { Dish } from './entities/dish.entity';
import { HallTable } from './entities/hall-table.entity';
import { Hall } from './entities/hall.entity';
import { MenuSection } from './entities/menu-section.entity';
import { Review } from './entities/review.entity';
import { User } from './entities/user.entity';

export const typeOrmEntities = [
  User,
  MenuSection,
  Dish,
  DishIngredient,
  Review,
  Hall,
  HallTable,
  Booking,
];
