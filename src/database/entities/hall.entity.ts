import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('halls')
export class Hall {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
