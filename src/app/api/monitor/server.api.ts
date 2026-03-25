import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import type { AjaxResult } from '../../core/types/api/common';

@Injectable({ providedIn: 'root' })
export class ServerApi {
  constructor(private http: HttpService) {}

  getServer(): Observable<AjaxResult<unknown>> {
    return this.http.get('/monitor/server');
  }
}
