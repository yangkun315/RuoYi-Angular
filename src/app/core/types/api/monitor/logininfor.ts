import type { PageDomain, BaseEntity } from '../common';

export interface LogininforQueryParams extends PageDomain {
  ipaddr?: string;
  userName?: string;
  status?: string;
  params?: { beginTime?: string; endTime?: string };
}

export interface SysLogininfor extends BaseEntity {
  infoId?: number;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  status?: '0' | '1';
  msg?: string;
  loginTime?: string;
}
