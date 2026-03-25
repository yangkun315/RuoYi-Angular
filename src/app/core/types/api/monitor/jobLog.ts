import type { PageDomain, BaseEntity } from '../common';

export interface JobLogQueryParams extends PageDomain {
  jobId?: number;
  jobName?: string;
  jobGroup?: string;
  status?: string;
  params?: { beginTime?: string; endTime?: string };
}

export interface SysJobLog extends BaseEntity {
  jobLogId?: number;
  jobId?: number;
  jobName?: string;
  jobGroup?: string;
  invokeTarget?: string;
  jobMessage?: string;
  status?: '0' | '1';
  exceptionInfo?: string;
  createTime?: string;
}
