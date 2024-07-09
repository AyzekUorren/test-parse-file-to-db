import { BullModuleOptions } from '@nestjs/bull';
import { registerAs } from '@nestjs/config';
import { BullQueues } from 'src/common/enums';

export default registerAs(
  BullQueues.FileProcessing,
  (): BullModuleOptions => ({
    name: BullQueues.FileProcessing,
  }),
);
