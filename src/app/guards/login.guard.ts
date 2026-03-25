import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

/** 已登录用户访问登录页时重定向到首页 */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.getToken()) {
    return router.createUrlTree(['/']);
  }
  return true;
};
