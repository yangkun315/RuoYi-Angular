import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { ConfigQueryParams, SysConfig } from '../../core/types/api/system/config';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class ConfigApi {
  constructor(private http: HttpService) {}

  listConfig(query: ConfigQueryParams): Observable<TableDataInfo<SysConfig>> {
    return this.http.get('/system/config/list', query as unknown as Record<string, unknown>);
  }

  getConfig(configId: number): Observable<AjaxResult<SysConfig>> {
    return this.http.get('/system/config/' + configId);
  }

  getConfigKey(configKey: string): Observable<AjaxResult> {
    return this.http.get('/system/config/configKey/' + configKey);
  }

  addConfig(data: SysConfig): Observable<AjaxResult> {
    return this.http.post('/system/config', data);
  }

  updateConfig(data: SysConfig): Observable<AjaxResult> {
    return this.http.put('/system/config', data);
  }

  delConfig(configId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/config/' + configId);
  }

  refreshCache(): Observable<AjaxResult> {
    return this.http.delete('/system/config/refreshCache');
  }
}
