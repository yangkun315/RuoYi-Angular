import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { IS_TOKEN } from '../http-context';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const needToken = req.context.get(IS_TOKEN);

  let newReq = req;
  if (token && needToken) {
    newReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(newReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.removeToken();
        if (!window.location.href.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return throwError(() => err);
    })
  );
};
