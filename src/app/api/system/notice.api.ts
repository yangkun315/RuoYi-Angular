import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { NoticeQueryParams, SysNotice, SysNoticeTopResult } from '../../core/types/api/system/notice';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class NoticeApi {
  constructor(private http: HttpService) {}

  listNotice(query: NoticeQueryParams): Observable<TableDataInfo<SysNotice>> {
    return this.http.get('/system/notice/list', query as unknown as Record<string, unknown>);
  }

  getNotice(noticeId: number): Observable<AjaxResult<SysNotice>> {
    return this.http.get('/system/notice/' + noticeId);
  }

  addNotice(data: SysNotice): Observable<AjaxResult> {
    return this.http.post('/system/notice', data);
  }

  updateNotice(data: SysNotice): Observable<AjaxResult> {
    return this.http.put('/system/notice', data);
  }

  delNotice(noticeId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/notice/' + noticeId);
  }

  listNoticeTop(): Observable<SysNoticeTopResult> {
    return this.http.get('/system/notice/listTop');
  }

  markNoticeRead(noticeId: number): Observable<AjaxResult> {
    return this.http.post('/system/notice/markRead', {}, { noticeId });
  }

  markNoticeReadAll(ids: string): Observable<AjaxResult> {
    return this.http.post('/system/notice/markReadAll', {}, { ids });
  }
}
