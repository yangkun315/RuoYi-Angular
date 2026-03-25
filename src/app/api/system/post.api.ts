import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { PostQueryParams, SysPost } from '../../core/types/api/system/post';
import type { AjaxResult, TableDataInfo } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class PostApi {
  constructor(private http: HttpService) {}

  listPost(query: PostQueryParams): Observable<TableDataInfo<SysPost>> {
    return this.http.get('/system/post/list', query as unknown as Record<string, unknown>);
  }

  getPost(postId: number): Observable<AjaxResult<SysPost>> {
    return this.http.get('/system/post/' + postId);
  }

  addPost(data: SysPost): Observable<AjaxResult> {
    return this.http.post('/system/post', data);
  }

  updatePost(data: SysPost): Observable<AjaxResult> {
    return this.http.put('/system/post', data);
  }

  delPost(postId: number | number[]): Observable<AjaxResult> {
    return this.http.delete('/system/post/' + postId);
  }
}
