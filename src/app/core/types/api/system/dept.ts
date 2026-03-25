import type { BaseEntity, AjaxResult } from '../common';

export interface DeptQueryParams {
  deptName?: string;
  status?: string;
}

export interface DeptSortParams {
  deptIds: string;
  orderNums: string;
}

export interface SysDept extends BaseEntity {
  deptId?: number;
  parentId?: number;
  ancestors?: string;
  deptName?: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: '0' | '1';
  children?: SysDept[];
}
