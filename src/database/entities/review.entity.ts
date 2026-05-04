import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dish } from './dish.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'dish_id', type: 'int' })
  dishId!: number;

  @ManyToOne(() => Dish, (dish) => dish.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dish_id' })
  dish!: Dish;

  @Column({ name: 'author_name', type: 'varchar', length: 255 })
  authorName!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
