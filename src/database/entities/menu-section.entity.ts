import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('menu_sections')
export class MenuSection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
