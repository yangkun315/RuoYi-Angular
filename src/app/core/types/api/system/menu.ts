import type { BaseEntity, AjaxResult, TreeSelect } from '../common';

export interface MenuQueryParams {
  menuName?: string;
  status?: string;
}

export interface MenuSortParams {
  menuIds: string;
  orderNums: string;
}

export interface SysMenu extends BaseEntity {
  menuId?: number;
  parentId?: number;
  menuName?: string;
  orderNum?: number;
  path?: string;
  component?: string;
  query?: string;
  routeName?: string;
  perms?: string;
  icon?: string;
  isFrame?: '0' | '1';
  isCache?: '0' | '1';
  menuType?: 'M' | 'C' | 'F';
  visible?: '0' | '1';
  status?: '0' | '1';
  children?: SysMenu[];
}

export interface RoleMenuTreeselectResult extends AjaxResult {
  checkedKeys: number[];
  menus: TreeSelect[];
}
