import { registerAs } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export default registerAs(
  'throttlers',
  (): ThrottlerModuleOptions => ({
    throttlers: [
      {
        ttl: parseInt(process.env.TTL_Limit) || 60000,
        limit: parseInt(process.env.THROTTLER_LIMIT) || 10,
      },
    ],
  }),
);
