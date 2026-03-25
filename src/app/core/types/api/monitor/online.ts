import type { PageDomain } from '../common';

export interface OnlineQueryParams extends PageDomain {
  ipaddr?: string;
  userName?: string;
}

export interface SysUserOnline {
  tokenId?: string;
  deptName?: string;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  loginTime?: number;
}
