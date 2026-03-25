import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ALLOW_ANONYMOUS } from '@delon/auth';
import type {
  LoginInfoResult,
  UserInfoResult,
  CaptchaInfoResult
} from '../types/api/login';
import { IS_TOKEN, REPEAT_SUBMIT } from '../http-context';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private http: HttpClient) {}

  /** 登录：不携带 token、不防重复提交、忽略 @delon/auth 校验 */
  private loginContext = new HttpContext()
    .set(IS_TOKEN, false)
    .set(REPEAT_SUBMIT, false)
    .set(ALLOW_ANONYMOUS, true);

  /** 登录 */
  login(username: string, password: string, code: string, uuid: string): Observable<LoginInfoResult> {
    return this.http.post<LoginInfoResult>('/login', {
      username,
      password,
      code,
      uuid
    }, { context: this.loginContext });
  }

  /** 获取用户信息 */
  getInfo(): Observable<UserInfoResult> {
    return this.http.get<UserInfoResult>('/getInfo');
  }

  /** 获取验证码 */
  getCodeImg(): Observable<CaptchaInfoResult> {
    return this.http.get<CaptchaInfoResult>('/captchaImage', {
      context: new HttpContext().set(IS_TOKEN, false).set(ALLOW_ANONYMOUS, true)
    });
  }

  /** 退出登录 */
  logout(): Observable<unknown> {
    return this.http.post('/logout', {});
  }

  /** 解锁屏幕 */
  unlockScreen(password: string): Observable<unknown> {
    return this.http.post('/unlockscreen', { password });
  }
}
