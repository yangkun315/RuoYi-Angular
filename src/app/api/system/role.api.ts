import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type {
  RoleQueryParams,
  AuthUserQueryParams,
  AuthUserSelectParams,
  SysRole,
  SysUserRole,
  RoleDeptTreeResult
} from '../../core/types/api/system/role';
import type { SysUser } from '../../core/types/api/system/user';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class RoleApi {
  constructor(private http: HttpService) {}

  listRole(query: RoleQueryParams): Observable<TableDataInfo<SysRole>> {
    return this.http.get('/system/role/list', query as unknown as Record<string, unknown>);
  }

  getRole(roleId: number): Observable<AjaxResult<SysRole>> {
    return this.http.get('/system/role/' + roleId);
  }

  addRole(data: SysRole): Observable<AjaxResult> {
    return this.http.post('/system/role', data);
  }

  updateRole(data: SysRole): Observable<AjaxResult> {
    return this.http.put('/system/role', data);
  }

  dataScope(data: SysRole): Observable<AjaxResult> {
    return this.http.put('/system/role/dataScope', data);
  }

  changeRoleStatus(roleId: number, status: string): Observable<AjaxResult> {
    return this.http.put('/system/role/changeStatus', { roleId, status });
  }

  delRole(roleId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/role/' + roleId);
  }

  allocatedUserList(query: AuthUserQueryParams): Observable<TableDataInfo<SysUser>> {
    return this.http.get('/system/role/authUser/allocatedList', query as unknown as Record<string, unknown>);
  }

  unallocatedUserList(query: AuthUserQueryParams): Observable<TableDataInfo<SysUser>> {
    return this.http.get('/system/role/authUser/unallocatedList', query as unknown as Record<string, unknown>);
  }

  authUserCancel(data: SysUserRole): Observable<AjaxResult> {
    return this.http.put('/system/role/authUser/cancel', data);
  }

  authUserCancelAll(data: AuthUserSelectParams): Observable<AjaxResult> {
    return this.http.put('/system/role/authUser/cancelAll', undefined, data as unknown as Record<string, unknown>);
  }

  authUserSelectAll(data: AuthUserSelectParams): Observable<AjaxResult> {
    return this.http.put('/system/role/authUser/selectAll', undefined, data as unknown as Record<string, unknown>);
  }

  deptTreeSelect(roleId: number): Observable<RoleDeptTreeResult> {
    return this.http.get('/system/role/deptTree/' + roleId);
  }
}
