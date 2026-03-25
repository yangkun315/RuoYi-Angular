import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { GenQueryParams, GenTable, GenTableInfoResult } from '../../core/types/api/tool/gen';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class GenApi {
  constructor(private http: HttpService) {}

  listTable(query: GenQueryParams): Observable<TableDataInfo<GenTable>> {
    return this.http.get('/tool/gen/list', query as unknown as Record<string, unknown>);
  }

  listDbTable(query: GenQueryParams): Observable<TableDataInfo<GenTable>> {
    return this.http.get('/tool/gen/db/list', query as unknown as Record<string, unknown>);
  }

  getGenTable(tableId: number): Observable<AjaxResult<GenTableInfoResult>> {
    return this.http.get('/tool/gen/' + tableId);
  }

  updateGenTable(data: GenTable): Observable<AjaxResult> {
    return this.http.put('/tool/gen', data);
  }

  importTable(data: Record<string, unknown>): Observable<AjaxResult> {
    return this.http.post('/tool/gen/importTable', undefined, data);
  }

  createTable(data: Record<string, unknown>): Observable<AjaxResult> {
    return this.http.post('/tool/gen/createTable', undefined, data);
  }

  previewTable(tableId: number): Observable<AjaxResult<unknown>> {
    return this.http.get('/tool/gen/preview/' + tableId);
  }

  delTable(tableId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/tool/gen/' + tableId);
  }

  genCode(tableName: string): Observable<AjaxResult> {
    return this.http.get('/tool/gen/genCode/' + tableName);
  }

  synchDb(tableName: string): Observable<AjaxResult> {
    return this.http.get('/tool/gen/synchDb/' + tableName);
  }
}
