import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { MenuQueryParams, MenuSortParams, SysMenu, RoleMenuTreeselectResult } from '../../core/types/api/system/menu';
import type { AjaxResult } from '../../core/types/api/common';
import type { TreeSelect } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class MenuApi {
  constructor(private http: HttpService) {}

  listMenu(query?: MenuQueryParams): Observable<AjaxResult<SysMenu[]>> {
    return this.http.get('/system/menu/list', query as unknown as Record<string, unknown>);
  }

  getMenu(menuId: number): Observable<AjaxResult<SysMenu>> {
    return this.http.get('/system/menu/' + menuId);
  }

  treeselect(): Observable<AjaxResult<TreeSelect[]>> {
    return this.http.get('/system/menu/treeselect');
  }

  roleMenuTreeselect(roleId: number): Observable<RoleMenuTreeselectResult> {
    return this.http.get('/system/menu/roleMenuTreeselect/' + roleId);
  }

  addMenu(data: SysMenu): Observable<AjaxResult> {
    return this.http.post('/system/menu', data);
  }

  updateMenu(data: SysMenu): Observable<AjaxResult> {
    return this.http.put('/system/menu', data);
  }

  updateMenuSort(data: MenuSortParams): Observable<AjaxResult> {
    return this.http.put('/system/menu/updateSort', data);
  }

  delMenu(menuId: number): Observable<AjaxResult> {
    return this.http.delete('/system/menu/' + menuId);
  }
}
