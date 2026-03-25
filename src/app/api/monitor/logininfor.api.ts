import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { LogininforQueryParams } from '../../core/types/api/monitor/logininfor';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';
import type { SysLogininfor } from '../../core/types/api/monitor/logininfor';

@Injectable({ providedIn: 'root' })
export class LogininforApi {
  constructor(private http: HttpService) {}

  list(query: LogininforQueryParams): Observable<TableDataInfo<SysLogininfor>> {
    return this.http.get('/monitor/logininfor/list', query as unknown as Record<string, unknown>);
  }

  delLogininfor(infoId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/monitor/logininfor/' + infoId);
  }

  unlockLogininfor(userName: string): Observable<AjaxResult> {
    return this.http.get('/monitor/logininfor/unlock/' + userName);
  }

  cleanLogininfor(): Observable<AjaxResult> {
    return this.http.delete('/monitor/logininfor/clean');
  }
}
