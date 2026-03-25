import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = params ? this.toHttpParams(params) : undefined;
    return this.http.get<T>(url, { params: httpParams });
  }

  post<T>(url: string, body: unknown, params?: Record<string, unknown>): Observable<T> {
    const httpParams = params ? this.toHttpParams(params) : undefined;
    return this.http.post<T>(url, body, { params: httpParams });
  }

  put<T>(url: string, body: unknown, params?: Record<string, unknown>): Observable<T> {
    const httpParams = params ? this.toHttpParams(params) : undefined;
    return this.http.put<T>(url, body, { params: httpParams });
  }

  delete<T>(url: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = params ? this.toHttpParams(params) : undefined;
    return this.http.delete<T>(url, { params: httpParams });
  }

  private toHttpParams(obj: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined || v === '') continue;
      if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
        for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
          if (sv !== null && sv !== undefined && sv !== '') {
            params = params.set(`${k}[${sk}]`, String(sv));
          }
        }
      } else {
        params = params.set(k, String(v));
      }
    }
    return params;
  }
}
