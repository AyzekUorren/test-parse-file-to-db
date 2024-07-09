import { DepartmentDTO } from './department.dto';
import { DonationDTO } from './donation.dto';
import { StatementDTO } from './statment.dto';

export class EmployeeDTO {
  id: number;
  firstName: string;
  lastName: string;
  department: DepartmentDTO;
  salaries: StatementDTO[];
  donations: DonationDTO[];
}
