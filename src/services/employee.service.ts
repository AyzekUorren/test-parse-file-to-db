import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DepartmentDTO,
  DonationDTO,
  EmployeeDTO,
  StatementDTO,
} from 'src/common/dto';
import { Department, Donation, Employee, Statement } from 'src/common/entities';
import { DataSource, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
  ) {}

  private async addDepartment(
    data: DepartmentDTO,
    queryRunner: QueryRunner,
  ): Promise<Department> {
    const item = await await queryRunner.manager.findOne(Department, {
      where: { id: data.id },
    });

    if (!item) {
      const newItem = queryRunner.manager.create(Department, data);
      return await queryRunner.manager.save(Department, newItem);
    }

    const updatedItem = queryRunner.manager.merge(Department, item, data);
    return await queryRunner.manager.save(Department, updatedItem);
  }

  private async addEmployee(
    data: EmployeeDTO,
    department: Department,
    queryRunner: QueryRunner,
  ): Promise<Employee> {
    const employee = await queryRunner.manager.findOne(Employee, {
      where: { id: data.id },
    });

    if (!employee) {
      const newEmployee = queryRunner.manager.create(Employee, {
        ...data,
        department,
      });
      return await queryRunner.manager.save(Employee, newEmployee);
    }

    const updatedEmployee = queryRunner.manager.merge(Employee, employee, {
      ...data,
      department: department,
      donations: employee.donations,
      salaries: employee.salaries,
    });
    return await queryRunner.manager.save(Employee, updatedEmployee);
  }

  private async addStatement(
    data: StatementDTO,
    employee: Employee,
    queryRunner: QueryRunner,
  ): Promise<Statement> {
    const item = await queryRunner.manager.findOne(Statement, {
      where: { id: data.id, employee: { id: employee.id } },
    });

    if (!item) {
      const newItem = queryRunner.manager.create(Statement, {
        ...data,
        employee,
      });
      return await queryRunner.manager.save(Statement, newItem);
    }

    const updatedItem = queryRunner.manager.merge(Statement, item, data);
    return await queryRunner.manager.save(Statement, updatedItem);
  }

  private async addDonation(
    data: DonationDTO,
    employee: Employee,
    queryRunner: QueryRunner,
  ): Promise<Donation> {
    const item = await queryRunner.manager.findOne(Donation, {
      where: { id: data.id, employee: { id: employee.id } },
    });

    if (!item) {
      const newItem = queryRunner.manager.create(Donation, {
        ...data,
        employee,
      });
      return await queryRunner.manager.save(Donation, newItem);
    }

    const updatedItem = queryRunner.manager.merge(Donation, item, data);
    return await queryRunner.manager.save(Donation, updatedItem);
  }

  async getMany(): Promise<EmployeeDTO[]> {
    return this.employeeRepository.find({
      relations: { department: true, salaries: true, donations: true },
    });
  }

  async addMany(employees: EmployeeDTO[]): Promise<void> {
    for (const employeeData of employees) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const department = await this.addDepartment(
          employeeData.department,
          queryRunner,
        );

        const employee = await this.addEmployee(
          employeeData,
          department,
          queryRunner,
        );

        for (const salaryData of employeeData.salaries) {
          await this.addStatement(salaryData, employee, queryRunner);
        }

        for (const donationData of employeeData.donations) {
          await this.addDonation(donationData, employee, queryRunner);
        }

        await queryRunner.commitTransaction();
        this.logger.log(
          `Employee ${employee.firstName} ${employee.lastName} and related data saved successfully`,
        );
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Failed to save data for employee ${employeeData.firstName} ${employeeData.lastName}`,
          error.stack,
        );
      } finally {
        await queryRunner.release();
      }
    }
  }

  async calculateRewards() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      return queryRunner.query(`WITH total_donations AS (
    SELECT
        "employeeId",
        SUM(amount) AS total_amount
    FROM
        "Donations"
    GROUP BY
        "employeeId"
),
filtered_donations AS (
    SELECT
        "employeeId",
        total_amount
    FROM
        total_donations
    WHERE
        total_amount > 100
),
total_filtered_amount AS (
    SELECT
        SUM(total_amount) AS total_amount
    FROM
        filtered_donations
)
SELECT
    e.id,
    e."firstName",
    e."lastName",
    fd.total_amount AS employeeDonation,
    (fd.total_amount / tfa.total_amount) * 10000 AS reward
FROM
    filtered_donations fd
JOIN
    total_filtered_amount tfa ON 1=1
JOIN
    "Employees" e ON e.id = fd."employeeId"
ORDER BY
    reward DESC;
`);
    } catch (error) {
      this.logger.error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
