import type { SysRole } from './role';
import type { SysDept } from './dept';
import type { SysPost } from './post';
import type { PageDomain, AjaxResult, BaseEntity } from '../common';

export interface UserQueryParams extends PageDomain {
  userName?: string;
  phonenumber?: string;
  status?: '0' | '1';
  deptId?: number;
  params?: { beginTime?: string; endTime?: string };
}

export interface AuthUserQueryParams extends UserQueryParams {
  roleId?: number;
}

export interface SysUser extends BaseEntity {
  userId?: number;
  deptId?: number;
  userName?: string;
  nickName?: string;
  email?: string;
  phonenumber?: string;
  sex?: '0' | '1' | '2';
  avatar?: string;
  password?: string;
  status?: '0' | '1';
  dept?: SysDept;
  roles?: SysRole[];
  roleIds?: number[];
  postIds?: number[];
}

export interface UserFormDataResult extends AjaxResult {
  data?: SysUser;
  postIds?: number[];
  roleIds?: number[];
  roles: SysRole[];
  posts: SysPost[];
}

/** GET /system/user/profile：data 为当前用户，另含角色/岗位文案 */
export interface UserProfileResult extends AjaxResult<SysUser> {
  roleGroup?: string;
  postGroup?: string;
}

export interface UserProfileAvatarResult extends AjaxResult {
  /** 若依上传成功后返回的头像地址 */
  imgUrl?: string;
}

export interface UserAuthRoleResult extends AjaxResult {
  user: SysUser;
  roles: SysRole[];
}

export interface SysUserRoles {
  userId?: number;
  roleIds?: number[];
}
