import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type {
  UserQueryParams,
  UserFormDataResult,
  UserProfileResult,
  UserProfileAvatarResult,
  UserAuthRoleResult,
  SysUser,
  SysUserRoles
} from '../../core/types/api/system/user';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';
import type { TreeSelect } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class UserApi {
  constructor(private http: HttpService) {}

  listUser(query: UserQueryParams): Observable<TableDataInfo<SysUser[]>> {
    return this.http.get('/system/user/list', query as unknown as Record<string, unknown>);
  }

  getUser(userId?: number): Observable<UserFormDataResult> {
    return this.http.get('/system/user/' + (userId ?? ''));
  }

  addUser(data: SysUser): Observable<AjaxResult> {
    return this.http.post('/system/user', data);
  }

  updateUser(data: SysUser): Observable<AjaxResult> {
    return this.http.put('/system/user', data);
  }

  delUser(userId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/user/' + userId);
  }

  resetUserPwd(userId: number, password: string): Observable<AjaxResult> {
    return this.http.put('/system/user/resetPwd', { userId, password });
  }

  changeUserStatus(userId: number, status: string): Observable<AjaxResult> {
    return this.http.put('/system/user/changeStatus', { userId, status });
  }

  getUserProfile(): Observable<UserProfileResult> {
    return this.http.get('/system/user/profile');
  }

  updateUserProfile(data: SysUser): Observable<AjaxResult> {
    return this.http.put('/system/user/profile', data);
  }

  updateUserPwd(oldPassword: string, newPassword: string): Observable<AjaxResult> {
    return this.http.put('/system/user/profile/updatePwd', { oldPassword, newPassword });
  }

  /** 若依后端字段名为 avatarfile */
  uploadAvatar(file: Blob, fileName = 'avatar.png'): Observable<UserProfileAvatarResult> {
    const fd = new FormData();
    fd.append('avatarfile', file, fileName);
    return this.http.post('/system/user/profile/avatar', fd) as Observable<UserProfileAvatarResult>;
  }

  getAuthRole(userId: number): Observable<UserAuthRoleResult> {
    return this.http.get('/system/user/authRole/' + userId);
  }

  updateAuthRole(data: SysUserRoles): Observable<AjaxResult> {
    return this.http.put('/system/user/authRole', undefined, data as unknown as Record<string, unknown>);
  }

  deptTreeSelect(): Observable<AjaxResult<TreeSelect[]>> {
    return this.http.get('/system/user/deptTree');
  }
}
