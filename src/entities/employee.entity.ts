import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Department } from './department.entity';
import { Donation } from './donation.entity';
import { Statement } from './statement.entity';

@Entity('Employees')
export class Employee {
  @PrimaryColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => Department, (department) => department.employees, {
    onDelete: 'CASCADE',
  })
  department: Department;

  @OneToMany(() => Statement, (statement) => statement.employee)
  salaries: Statement[];

  @OneToMany(() => Donation, (donation) => donation.employee)
  donations: Donation[];
}
