import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Donations')
export class Donation {
  @PrimaryColumn()
  id: number;

  @Column('date')
  date: Date;

  @Column('decimal')
  amount: number;

  @Column()
  currency: string;

  @ManyToOne(() => Employee, (employee) => employee.donations, {
    onDelete: 'CASCADE',
  })
  employee: Employee;
}
