import { BullRootModuleOptions } from '@nestjs/bull';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'bull',
  (): BullRootModuleOptions => ({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
  }),
);
