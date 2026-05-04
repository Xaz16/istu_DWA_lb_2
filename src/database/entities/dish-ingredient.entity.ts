import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dish } from './dish.entity';

@Entity('dish_ingredients')
export class DishIngredient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'dish_id', type: 'int' })
  dishId!: number;

  @ManyToOne(() => Dish, (dish) => dish.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dish_id' })
  dish!: Dish;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
