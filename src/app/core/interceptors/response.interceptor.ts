import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../services/auth.service';

const ERROR_CODES: Record<string, string> = {
  '401': '认证失败，无法访问系统资源',
  '403': '当前操作没有权限',
  '404': '访问资源不存在',
  '500': '系统内部错误',
  '601': '操作提示',
  'default': '系统未知错误，请反馈给管理员'
};

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const msg = inject(NzMessageService);
  const notify = inject(NzNotificationService);
  const auth = inject(AuthService);

  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as Record<string, unknown> | null;
        if (!body || typeof body !== 'object') return event;

        const code = (body['code'] as number) ?? 200;
        const message = (ERROR_CODES[String(code)] ?? (body['msg'] as string)) ?? ERROR_CODES['default'];

        if (code === 401) {
          auth.removeToken();
          msg.error('登录状态已过期，请重新登录');
          if (!window.location.href.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error(message);
        }
        if (code === 500) {
          msg.error(message);
          throw new Error(message);
        }
        if (code === 601) {
          msg.warning(message);
          throw new Error(message);
        }
        if (code !== 200) {
          notify.error('错误', message);
          throw new Error(message);
        }
      }
      return event;
    }),
    catchError((err: HttpErrorResponse & { message?: string }) => {
      let message = err.message || err.error?.msg || '请求失败';
      if (message === 'Network Error') message = '后端接口连接异常';
      else if (message.includes('timeout')) message = '系统接口请求超时';
      else if (message.includes('status code')) message = '系统接口异常';
      msg.error(message, { nzDuration: 5000 });
      return throwError(() => err);
    })
  );
};
