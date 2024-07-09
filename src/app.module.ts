import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import bullConfig from './config/bull.config';
import databaseConfig from './config/database.config';
import fileProcessingQueueConfig from './config/file-processing-queue.config';
import throttlersConfig from './config/throttlers.config';
import { Employee, Department, Statement, Donation } from './common/entities';
import { AppController } from './app.controller';
import { FileProcessor } from './processors/file.processor';
import { EmployeeService } from './services/employee.service';
import { ParseService } from './services/parse.service';

@Module({
  imports: [
    ThrottlerModule.forRoot(throttlersConfig()),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([Employee, Department, Statement, Donation]),
    BullModule.forRoot(bullConfig()),
    BullModule.registerQueue(fileProcessingQueueConfig()),
  ],
  controllers: [AppController],
  providers: [ParseService, EmployeeService, FileProcessor],
})
export class AppModule {}
