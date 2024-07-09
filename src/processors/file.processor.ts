import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ParseService } from '../services/parse.service';
import { EmployeeService } from '../services/employee.service';
import { Logger } from '@nestjs/common';
import { BullQueues } from 'src/common/enums';

@Processor(BullQueues.FileProcessing)
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    private readonly parseService: ParseService,
    private readonly employeeService: EmployeeService,
  ) {}

  @Process()
  async handleFile(job: Job<{ file: string }>) {
    this.logger.log('Started processing file');
    const { file } = job.data;

    try {
      const employees = this.parseService.parseFile(file);
      await this.employeeService.addMany(employees);
      this.logger.log('File processed and data imported successfully');
    } catch (error) {
      this.logger.error('Error processing file', error);
    }
  }
}
