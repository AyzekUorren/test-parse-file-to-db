import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('Departments')
export class Department {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
