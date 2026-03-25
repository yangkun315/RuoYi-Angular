import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { DeptQueryParams, DeptSortParams, SysDept } from '../../core/types/api/system/dept';
import type { AjaxResult } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class DeptApi {
  constructor(private http: HttpService) {}

  listDept(query?: DeptQueryParams): Observable<AjaxResult<SysDept[]>> {
    return this.http.get('/system/dept/list', query as unknown as Record<string, unknown>);
  }

  listDeptExcludeChild(deptId: number): Observable<AjaxResult<SysDept[]>> {
    return this.http.get('/system/dept/list/exclude/' + deptId);
  }

  getDept(deptId: number): Observable<AjaxResult<SysDept>> {
    return this.http.get('/system/dept/' + deptId);
  }

  addDept(data: SysDept): Observable<AjaxResult> {
    return this.http.post('/system/dept', data);
  }

  updateDept(data: SysDept): Observable<AjaxResult> {
    return this.http.put('/system/dept', data);
  }

  updateDeptSort(data: DeptSortParams): Observable<AjaxResult> {
    return this.http.put('/system/dept/updateSort', data);
  }

  delDept(deptId: number): Observable<AjaxResult> {
    return this.http.delete('/system/dept/' + deptId);
  }
}
