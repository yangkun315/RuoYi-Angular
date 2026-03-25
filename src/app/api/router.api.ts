import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../core/services/http.service';
import type { AjaxResult } from '../core/types/api/common';
import type { RouterVo } from '../core/types/api/menu';

@Injectable({ providedIn: 'root' })
export class RouterApi {
  constructor(private http: HttpService) {}

  getRouters(): Observable<AjaxResult<RouterVo[]>> {
    return this.http.get<AjaxResult<RouterVo[]>>('/getRouters');
  }
}
