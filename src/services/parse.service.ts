import { Injectable } from '@nestjs/common';
import { FILE_DATA_TYPES } from 'src/common/constants';
import {
  DepartmentDTO,
  DonationDTO,
  EmployeeDTO,
  StatementDTO,
} from 'src/common/dto';

@Injectable()
export class ParseService {
  private readonly employeeDataLength: number = 4;
  private readonly departmentDataLength: number = 3;
  private readonly statmentDataLength: number = 5;
  private readonly donationDataLength: number = 5;
  private readonly rateDataLength: number = 4;

  private extractValue(line: string): string {
    return line.split(':')[1].trim();
  }

  private parseStatement(
    lines: string[],
    index: number,
  ): [StatementDTO[], number] {
    const statements: StatementDTO[] = [];
    while (
      index < lines.length &&
      lines[index].trim().startsWith(FILE_DATA_TYPES.Statement)
    ) {
      const statement: StatementDTO = {
        id: parseInt(this.extractValue(lines[index + 1])),
        amount: parseFloat(this.extractValue(lines[index + 2])),
        date: new Date(this.extractValue(lines[index + 3])),
      };
      statements.push(statement);
      index += this.statmentDataLength;
    }

    return [statements, index - this.statmentDataLength];
  }

  private parseRates(lines: string[]): Record<string, number> {
    const rates: Record<string, number> = {};
    let index = 0;
    while (index < lines.length) {
      if (lines[index].trim() === FILE_DATA_TYPES.Rate) {
        const date = this.extractValue(lines[index + 1]);
        const currency = this.extractValue(lines[index + 2]);
        const rate = parseFloat(this.extractValue(lines[index + 3]));
        rates[`${date}_${currency}`] = rate;
        index += this.rateDataLength;
      } else {
        index += 1;
      }
    }

    return rates;
  }

  private convertToUSD(
    amount: number,
    currency: string,
    date: string,
    rates: Record<string, number>,
  ): number | null {
    const rateKey = `${date}_${currency}`;
    const rate = rates[rateKey];

    if (!rate) {
      return null;
    }

    return amount * rate;
  }

  private parseDonation(
    lines: string[],
    index: number,
    rates: Record<string, number>,
  ): [DonationDTO[], number] {
    const donations: DonationDTO[] = [];
    while (
      index < lines.length &&
      lines[index].trim().startsWith(FILE_DATA_TYPES.Donation)
    ) {
      const [amount, currency] = this.extractValue(lines[index + 3]).split(' ');
      const dateString = this.extractValue(lines[index + 2]);

      const convertedAmount = this.convertToUSD(
        parseFloat(amount),
        currency,
        dateString,
        rates,
      );

      const donation: DonationDTO = {
        id: parseInt(this.extractValue(lines[index + 1])),
        date: new Date(dateString),
        amount: convertedAmount ? convertedAmount : parseFloat(amount),
        currency: convertedAmount ? 'USD' : currency,
      };
      donations.push(donation);
      index += this.donationDataLength;
    }

    return [donations, index - this.donationDataLength];
  }

  parseFile(content: string): EmployeeDTO[] {
    const lines = content.split('\n');

    const rates = this.parseRates(lines);

    const employees: EmployeeDTO[] = [];
    let index = 0;

    while (index < lines.length) {
      if (lines[index].trim() === FILE_DATA_TYPES.Employee) {
        const employee: EmployeeDTO = {
          id: parseInt(this.extractValue(lines[index + 1])),
          firstName: this.extractValue(lines[index + 2]),
          lastName: this.extractValue(lines[index + 3]),
          department: null,
          salaries: [],
          donations: [],
        };
        index += this.employeeDataLength + 1;

        if (lines[index].trim() === FILE_DATA_TYPES.Department) {
          const department: DepartmentDTO = {
            id: parseInt(this.extractValue(lines[index + 1])),
            name: this.extractValue(lines[index + 2]),
          };
          employee.department = department;
          index += this.departmentDataLength + 1;
        }

        if (lines[index].trim() === FILE_DATA_TYPES.Salary) {
          [employee.salaries, index] = this.parseStatement(lines, index + 2);
          index += this.statmentDataLength + 1;
        }

        if (
          index < lines.length &&
          lines[index].trim() === FILE_DATA_TYPES.Donation
        ) {
          [employee.donations, index] = this.parseDonation(lines, index, rates);
          index += this.donationDataLength + 1;
        }

        employees.push(employee);
      } else {
        index += 1;
      }
    }

    return employees;
  }
}
