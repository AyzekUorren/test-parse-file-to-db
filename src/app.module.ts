import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { ParseService } from './services/parse.service';
import { EmployeeService } from './services/employee.service';
import { FileProcessor } from './processors/file.processor';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Statement } from './entities/statement.entity';
import { Donation } from './entities/donation.entity';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'employees_db',
      entities: [Employee, Department, Statement, Donation],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Employee, Department, Statement, Donation]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'file-processing',
    }),
  ],
  controllers: [AppController],
  providers: [ParseService, EmployeeService, FileProcessor],
})
export class AppModule {}
