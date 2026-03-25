import type { PageDomain, BaseEntity } from '../common';

export interface OperlogQueryParams extends PageDomain {
  operIp?: string;
  title?: string;
  operName?: string;
  businessType?: number;
  status?: string;
  params?: { beginTime?: string; endTime?: string };
}

export interface SysOperLog extends BaseEntity {
  operId?: number;
  title?: string;
  businessType?: number;
  method?: string;
  requestMethod?: string;
  operatorType?: string;
  operName?: string;
  deptName?: string;
  operUrl?: string;
  operIp?: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  errorMsg?: string;
  operTime?: Date;
  costTime?: number;
  status?: '0' | '1';
}
