import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { SysCache } from '../../core/types/api/monitor/cache';
import type { AjaxResult } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class CacheApi {
  constructor(private http: HttpService) {}

  getCache(): Observable<AjaxResult<unknown>> {
    return this.http.get('/monitor/cache');
  }

  listCacheName(): Observable<AjaxResult<SysCache[]>> {
    return this.http.get('/monitor/cache/getNames');
  }

  listCacheKey(cacheName: string): Observable<AjaxResult<string[]>> {
    return this.http.get('/monitor/cache/getKeys/' + cacheName);
  }

  getCacheValue(cacheName: string, cacheKey: string): Observable<AjaxResult<SysCache>> {
    return this.http.get('/monitor/cache/getValue/' + cacheName + '/' + cacheKey);
  }

  clearCacheName(cacheName: string): Observable<AjaxResult> {
    return this.http.delete('/monitor/cache/clearCacheName/' + cacheName);
  }

  clearCacheKey(cacheKey: string): Observable<AjaxResult> {
    return this.http.delete('/monitor/cache/clearCacheKey/' + cacheKey);
  }

  clearCacheAll(): Observable<AjaxResult> {
    return this.http.delete('/monitor/cache/clearCacheAll');
  }
}
