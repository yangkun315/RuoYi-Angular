import type { PageDomain, BaseEntity, AjaxResult, TableDataInfo } from '../common';

export interface NoticeQueryParams extends PageDomain {
  noticeTitle?: string;
  createBy?: string;
  noticeType?: string;
}

export interface SysNotice extends BaseEntity {
  noticeId?: number;
  noticeTitle?: string;
  noticeType?: '1' | '2';
  noticeContent?: string;
  status?: '0' | '1';
}

export interface SysNoticeTopResult extends AjaxResult {
  data?: Array<{ notice: SysNotice; read: boolean }>;
}
