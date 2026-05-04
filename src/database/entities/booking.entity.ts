import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { HallTable } from './hall-table.entity';

@Entity('bookings')
@Unique('bookings_table_id_visit_date_key', ['tableId', 'visitDate'])
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'table_id', type: 'int' })
  tableId!: number;

  @ManyToOne(() => HallTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table!: HallTable;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate!: Date;

  @Column({ name: 'guest_count', type: 'int' })
  guestCount!: number;

  @Column({ name: 'contact_name', type: 'varchar', length: 255 })
  contactName!: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 64 })
  contactPhone!: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
