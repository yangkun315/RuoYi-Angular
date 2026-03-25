import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { JobLogQueryParams } from '../../core/types/api/monitor/jobLog';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';
import type { SysJobLog } from '../../core/types/api/monitor/jobLog';

@Injectable({ providedIn: 'root' })
export class JobLogApi {
  constructor(private http: HttpService) {}

  listJobLog(query: JobLogQueryParams): Observable<TableDataInfo<SysJobLog>> {
    return this.http.get('/monitor/jobLog/list', query as unknown as Record<string, unknown>);
  }

  delJobLog(jobLogId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/monitor/jobLog/' + jobLogId);
  }

  cleanJobLog(): Observable<AjaxResult> {
    return this.http.delete('/monitor/jobLog/clean');
  }
}
