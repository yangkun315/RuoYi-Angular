import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { OnlineQueryParams } from '../../core/types/api/monitor/online';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';
import type { SysUserOnline } from '../../core/types/api/monitor/online';

@Injectable({ providedIn: 'root' })
export class OnlineApi {
  constructor(private http: HttpService) {}

  list(query: OnlineQueryParams): Observable<TableDataInfo<SysUserOnline>> {
    return this.http.get('/monitor/online/list', query as unknown as Record<string, unknown>);
  }

  forceLogout(tokenId: string): Observable<AjaxResult> {
    return this.http.delete('/monitor/online/' + tokenId);
  }
}
