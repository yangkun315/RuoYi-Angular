import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { JobQueryParams, SysJob } from '../../core/types/api/monitor/job';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class JobApi {
  constructor(private http: HttpService) {}

  listJob(query: JobQueryParams): Observable<TableDataInfo<SysJob>> {
    return this.http.get('/monitor/job/list', query as unknown as Record<string, unknown>);
  }

  getJob(jobId: number): Observable<AjaxResult<SysJob>> {
    return this.http.get('/monitor/job/' + jobId);
  }

  addJob(data: SysJob): Observable<AjaxResult> {
    return this.http.post('/monitor/job', data);
  }

  updateJob(data: SysJob): Observable<AjaxResult> {
    return this.http.put('/monitor/job', data);
  }

  delJob(jobId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/monitor/job/' + jobId);
  }

  changeJobStatus(jobId: number, status: string): Observable<AjaxResult> {
    return this.http.put('/monitor/job/changeStatus', { jobId, status });
  }

  runJob(jobId: number, jobGroup: string): Observable<AjaxResult> {
    return this.http.put('/monitor/job/run', { jobId, jobGroup });
  }
}
