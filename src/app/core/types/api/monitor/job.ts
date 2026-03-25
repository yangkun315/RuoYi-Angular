import type { PageDomain, BaseEntity } from '../common';

export interface JobQueryParams extends PageDomain {
  jobName?: string;
  jobGroup?: string;
  status?: string;
}

export interface SysJob extends BaseEntity {
  jobId?: number;
  jobName?: string;
  jobGroup?: string;
  invokeTarget?: string;
  cronExpression?: string;
  nextValidTime?: Date;
  misfirePolicy?: '1' | '2' | '3';
  concurrent?: '0' | '1';
  status?: '0' | '1';
}
