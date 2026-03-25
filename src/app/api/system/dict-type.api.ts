import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { DictTypeQueryParams, SysDictType } from '../../core/types/api/system/dict';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class DictTypeApi {
  constructor(private http: HttpService) {}

  listType(query: DictTypeQueryParams): Observable<TableDataInfo<SysDictType>> {
    return this.http.get('/system/dict/type/list', query as unknown as Record<string, unknown>);
  }

  getType(dictId: number): Observable<AjaxResult<SysDictType>> {
    return this.http.get('/system/dict/type/' + dictId);
  }

  addType(data: SysDictType): Observable<AjaxResult> {
    return this.http.post('/system/dict/type', data);
  }

  updateType(data: SysDictType): Observable<AjaxResult> {
    return this.http.put('/system/dict/type', data);
  }

  delType(dictId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/dict/type/' + dictId);
  }

  refreshCache(): Observable<AjaxResult> {
    return this.http.delete('/system/dict/type/refreshCache');
  }

  optionselect(): Observable<AjaxResult<SysDictType[]>> {
    return this.http.get('/system/dict/type/optionselect');
  }
}
