import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { OperlogQueryParams } from '../../core/types/api/monitor/operlog';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';
import type { SysOperLog } from '../../core/types/api/monitor/operlog';

@Injectable({ providedIn: 'root' })
export class OperlogApi {
  constructor(private http: HttpService) {}

  list(query: OperlogQueryParams): Observable<TableDataInfo<SysOperLog>> {
    return this.http.get('/monitor/operlog/list', query as unknown as Record<string, unknown>);
  }

  delOperlog(operId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/monitor/operlog/' + operId);
  }

  cleanOperlog(): Observable<AjaxResult> {
    return this.http.delete('/monitor/operlog/clean');
  }
}
