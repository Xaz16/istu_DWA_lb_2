import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DishIngredient } from './dish-ingredient.entity';
import { MenuSection } from './menu-section.entity';
import { Review } from './review.entity';

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'section_id', type: 'int' })
  sectionId!: number;

  @ManyToOne(() => MenuSection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  menuSection!: MenuSection;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'weight_g', type: 'int', nullable: true })
  weightG!: number | null;

  @Column({ type: 'int', nullable: true })
  calories!: number | null;

  @Column({ name: 'has_allergens', type: 'boolean', default: false })
  hasAllergens!: boolean;

  @Column({ name: 'is_spicy', type: 'boolean', default: false })
  isSpicy!: boolean;

  @Column({ name: 'kid_friendly', type: 'boolean', default: true })
  kidFriendly!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => DishIngredient, (dishIngredient) => dishIngredient.dish)
  ingredients!: DishIngredient[];

  @OneToMany(() => Review, (review) => review.dish)
  reviews!: Review[];
}
