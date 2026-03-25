import { APP_INITIALIZER, Injectable, Provider, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpContext } from '@angular/common/http';
import { IGNORE_BASE_URL, ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { Observable, zip, of, catchError, map, tap } from 'rxjs';
import type { AlainI18NService } from '@delon/theme';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
export function provideStartup(): Provider[] {
  return [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

@Injectable()
export class StartupService {
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private i18n = inject<AlainI18NService>(ALAIN_I18N_TOKEN);
  // RuoYi: 从后端 getRouters 获取菜单，getInfo 获取用户
  // If http request allows anonymous access, you need to add `ALLOW_ANONYMOUS`:
  // this.httpClient.get('/app', { context: new HttpContext().set(ALLOW_ANONYMOUS, true) })
  private appData$ = this.httpClient.get('/assets/tmp/app-data.json', {
    context: new HttpContext().set(IGNORE_BASE_URL, true)
  }).pipe(
    catchError((res: NzSafeAny) => {
      console.warn(`StartupService.load: Network request failed`, res);
      setTimeout(() => this.router.navigateByUrl(`/exception/500`));
      return of({});
    })
  );

  private handleAppData(res: NzSafeAny): void {
    // Application information: including site name, description, year
    this.settingService.setApp(res.app);
    // User information: including name, avatar, email address
    this.settingService.setUser(res.user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add(res.menu ?? []);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = res.app?.name;
  }

  
  private viaHttp(): Observable<void> {
    return this.appData$.pipe(map((res: NzSafeAny) => this.handleAppData(res)));
  }
  load(): Observable<void> {
    // 从 /assets/tmp/app-data.json 加载菜单与应用信息（含若依系统管理/监控/工具等）
    // 若需完全走后端动态路由，可改为请求 RuoYi getRouters 并在此处转换格式后 menuService.add
    const init$ = this.initI18n();
    const app$ = this.viaHttp();
    return zip(init$, app$).pipe(map(() => void 0));
  }

  private initI18n(): Observable<void> {
    // 优先使用已持久化的 lang，确保语言切换后刷新页面生效
    const lang = this.settingService.layout.lang ?? (this.i18n as NzSafeAny).getInitialLang?.() ?? 'zh-CN';
    return this.httpClient.get(`/assets/i18n/${lang}.json`, {
      context: new HttpContext().set(IGNORE_BASE_URL, true)
    }).pipe(
      catchError(() => of({})),
      tap((data: NzSafeAny) => {
        (this.i18n as NzSafeAny).use(lang, data);
        this.settingService.setLayout('lang', lang);
      }),
      map(() => void 0)
    );
  }
}
