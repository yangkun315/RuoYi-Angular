import type { PageDomain, BaseEntity, AjaxResult, TreeSelect } from '../common';
export interface AuthUserQueryParams extends PageDomain {
  roleId?: number;
  userName?: string;
  phonenumber?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface RoleQueryParams extends PageDomain {
  roleName?: string;
  roleKey?: string;
  status?: string;
  params?: { beginTime?: string; endTime?: string };
}

export interface AuthUserSelectParams {
  roleId: number;
  userIds: number[];
}

export interface SysUserRole {
  userId?: number;
  roleId: number;
}

export interface SysUserRoles {
  userId?: number;
  roleIds?: number[];
}

export interface SysRole extends BaseEntity {
  roleId?: number;
  roleName?: string;
  roleKey?: string;
  roleSort?: number;
  dataScope?: '1' | '2' | '3' | '4' | '5';
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  menuIds?: number[];
  deptIds?: number[];
  status?: '0' | '1';
}

export interface RoleDeptTreeResult extends AjaxResult {
  checkedKeys: number[];
  depts: TreeSelect[];
}
