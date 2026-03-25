import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { DictDataQueryParams, SysDictData } from '../../core/types/api/system/dict';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class DictDataApi {
  constructor(private http: HttpService) {}

  listData(query: DictDataQueryParams): Observable<TableDataInfo<SysDictData>> {
    return this.http.get('/system/dict/data/list', query as unknown as Record<string, unknown>);
  }

  getData(dictCode: number): Observable<AjaxResult<SysDictData>> {
    return this.http.get('/system/dict/data/' + dictCode);
  }

  getDicts(dictType: string): Observable<AjaxResult<SysDictData[]>> {
    return this.http.get('/system/dict/data/type/' + dictType);
  }

  addData(data: SysDictData): Observable<AjaxResult> {
    return this.http.post('/system/dict/data', data);
  }

  updateData(data: SysDictData): Observable<AjaxResult> {
    return this.http.put('/system/dict/data', data);
  }

  delData(dictCode: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/dict/data/' + dictCode);
  }
}
