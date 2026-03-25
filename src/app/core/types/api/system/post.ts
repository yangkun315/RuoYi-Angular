import type { PageDomain, BaseEntity, AjaxResult, TableDataInfo } from '../common';

export interface PostQueryParams extends PageDomain {
  postCode?: string;
  postName?: string;
  status?: string;
}

export interface SysPost extends BaseEntity {
  postId?: number;
  postCode?: string;
  postName?: string;
  postSort?: number;
  status?: '0' | '1';
}
