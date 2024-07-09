import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Statements')
export class Statement {
  @PrimaryColumn()
  id: number;

  @Column('decimal')
  amount: number;

  @Column('date')
  date: Date;

  @ManyToOne(() => Employee, (employee) => employee.salaries, {
    onDelete: 'CASCADE',
  })
  employee: Employee;
}
