import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Hall } from './hall.entity';

@Entity('hall_tables')
@Unique('hall_tables_hall_id_code_key', ['hallId', 'code'])
export class HallTable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'hall_id', type: 'int' })
  hallId!: number;

  @ManyToOne(() => Hall, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hall_id' })
  hall!: Hall;

  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Column({ name: 'pos_x', type: 'double precision', default: 0 })
  posX!: number;

  @Column({ name: 'pos_y', type: 'double precision', default: 0 })
  posY!: number;

  @Column({ name: 'seat_count', type: 'int', default: 2 })
  seatCount!: number;
}
