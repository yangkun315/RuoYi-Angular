import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpParams } from '@angular/common/http';
import { tansParams } from '../utils/params.util';

/** 将 GET 请求的 params 序列化为 RuoYi 后端兼容的查询串 */
export const paramsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.params.keys().length > 0) {
    const paramsObj: Record<string, unknown> = {};
    req.params.keys().forEach((k) => {
      paramsObj[k] = req.params.get(k);
    });
    const queryStr = tansParams(paramsObj);
    const url = queryStr ? `${req.url}?${queryStr.replace(/&$/, '')}` : req.url;
    return next(req.clone({ url, params: new HttpParams() }));
  }
  return next(req);
};
