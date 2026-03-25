import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { DA_SERVICE_TOKEN, SocialOpenType, SocialService } from '@delon/auth';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { LoginService } from '../../../core/services/login.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabChangeEvent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { finalize } from 'rxjs';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzTabsModule,
    NzAlertModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzTooltipModule
  ]
})
export class UserLoginComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);
  private readonly socialService = inject(SocialService);
  private readonly reuseTabService = inject(ReuseTabService, { optional: true });
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly startupSrv = inject(StartupService);
  private readonly loginService = inject(LoginService);
  private readonly cdr = inject(ChangeDetectorRef);

  form = inject(FormBuilder).nonNullable.group({
    userName: ['admin', [Validators.required]],
    password: ['admin123', [Validators.required]],
    mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
    captcha: ['', [Validators.required]],
    remember: [true]
  });
  error = '';
  type = 0;
  loading = false;
  captchaImg = '';
  uuid = '';
  captchaEnabled = true;
  captchaLoading = false;

  count = 0;
  interval$?: ReturnType<typeof setInterval>;

  switch({ index }: NzTabChangeEvent): void {
    this.type = index!;
    this.error = '';
  }

  ngOnInit(): void {
    this.loadCaptcha();
  }

  loadCaptcha(): void {
    this.captchaLoading = true;
    this.cdr.detectChanges();
    this.loginService.getCodeImg().subscribe({
      next: (res: any) => {
        this.captchaEnabled = res?.captchaEnabled ?? true;
        if (this.captchaEnabled) {
          this.captchaImg = res.img ?? '';
          this.uuid = res.uuid ?? '';
        } else {
          this.form.controls.captcha.clearValidators();
          this.form.controls.captcha.updateValueAndValidity();
        }
        this.captchaLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.captchaLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCaptcha(): void {
    const mobile = this.form.controls.mobile;
    if (mobile.invalid) {
      mobile.markAsDirty({ onlySelf: true });
      mobile.updateValueAndValidity({ onlySelf: true });
      return;
    }
    this.count = 59;
    this.interval$ = setInterval(() => {
      this.count -= 1;
      if (this.count <= 0) {
        clearInterval(this.interval$);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  submit(): void {
    this.error = '';
    if (this.type === 0) {
      // 账户密码登录
      const { userName, password, captcha } = this.form.controls;
      userName.markAsDirty();
      userName.updateValueAndValidity();
      password.markAsDirty();
      password.updateValueAndValidity();
      if (this.captchaImg) {
        captcha.markAsDirty();
        captcha.updateValueAndValidity();
      }
      if (userName.invalid || password.invalid || (this.captchaImg && captcha.invalid)) {
        return;
      }

      const { userName: u, password: p, captcha: c } = this.form.value;
      this.doLogin(u!, p!, c ?? '', this.uuid);
    } else {
      // 手机号登录（RuoYi 暂不支持，仅展示提示）
      const { mobile, captcha } = this.form.controls;
      mobile.markAsDirty();
      mobile.updateValueAndValidity();
      captcha.markAsDirty();
      captcha.updateValueAndValidity();
      if (mobile.invalid || captcha.invalid) {
        return;
      }
      this.error = '手机号登录功能暂未开放，请使用账户密码登录';
    }
  }

  private doLogin(userName: string, password: string, captcha: string, uuid: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.loginService.login(userName, password, captcha, uuid).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        const token = res?.token;
        if (!token) {
          this.error = res?.msg || '登录失败';
          this.loadCaptcha();
          return;
        }
        this.reuseTabService?.clear();
        this.tokenService.set({
          token,
          expired: +new Date() + 24 * 60 * 60 * 1000
        });
        this.startupSrv.load().subscribe(() => {
          const url = this.tokenService.referrer?.url || '/';
          this.router.navigateByUrl(url.includes('/passport') ? '/' : url);
        });
      },
      error: (err) => {
        this.error = err?.error?.msg || err?.message || '登录失败';
        this.loadCaptcha();
      }
    });
  }

  open(type: string, openType: SocialOpenType = 'href'): void {
    let url = ``;
    const callback = environment.production
      ? `https://ng-alain.github.io/ng-alain/#/passport/callback/${type}`
      : `http://localhost:4200/#/passport/callback/${type}`;
    switch (type) {
      case 'auth0':
        url = `//cipchk.auth0.com/login?client=8gcNydIDzGBYxzqV0Vm1CX_RXH-wsWo5&redirect_uri=${decodeURIComponent(callback)}`;
        break;
      case 'github':
        url = `//github.com/login/oauth/authorize?client_id=9d6baae4b04a23fcafa2&response_type=code&redirect_uri=${decodeURIComponent(callback)}`;
        break;
      case 'weibo':
        url = `https://api.weibo.com/oauth2/authorize?client_id=1239507802&response_type=code&redirect_uri=${decodeURIComponent(callback)}`;
        break;
    }
    if (openType === 'window') {
      this.socialService.login(url, '/', { type: 'window' }).subscribe(res => {
        if (res) {
          this.settingsService.setUser(res);
          this.router.navigateByUrl('/');
        }
      });
    } else {
      this.socialService.login(url, '/', { type: 'href' });
    }
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
