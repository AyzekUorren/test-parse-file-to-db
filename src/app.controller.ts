import { InjectQueue } from '@nestjs/bull';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Queue } from 'bull';
import { FileDTO } from './dto';
import { EmployeeService } from './services/employee.service';

@Controller()
@ApiTags('file-upload')
export class AppController {
  constructor(
    @InjectQueue('file-processing')
    private readonly fileProcessingQueue: Queue<FileDTO>,
    private readonly employeeService: EmployeeService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a dump file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and queued for processing',
  })
  @ApiResponse({
    status: 400,
    description: 'Missed reqired file',
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new HttpException('Missed reqired file', HttpStatus.BAD_REQUEST);
    }

    this.fileProcessingQueue.add({
      file: file.buffer.toString(),
    });
    return { message: 'File uploaded and queued for processing' };
  }

  @Get('employees')
  @ApiOperation({ summary: 'Get list of Employees' })
  @ApiResponse({ status: 200 })
  getEmployees() {
    return this.employeeService.getMany();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: 200, description: 'API is working' })
  getStatus() {
    return { status: 'API is working' };
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get rewards via SQL calculation' })
  getSQL() {
    return this.employeeService.calculateRewards();
  }
}
