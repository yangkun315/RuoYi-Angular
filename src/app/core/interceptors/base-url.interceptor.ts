import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (!req.url.startsWith('http') && !req.url.startsWith('/assets')) {
    const baseApi = environment.baseApi;
    const url = req.url.startsWith('/') ? `${baseApi}${req.url}` : `${baseApi}/${req.url}`;
    req = req.clone({ url });
  }
  return next(req);
};
