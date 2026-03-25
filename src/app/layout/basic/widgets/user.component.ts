import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { SettingsService, User } from '@delon/theme';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'header-user',
  template: `
    <div
      #userTrigger
      class="header-user-trigger alain-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzTrigger="click"
      nzPlacement="bottomRight"
      nzOverlayClassName="header-user-dropdown"
      [nzOverlayStyle]="userMenuOverlayStyle"
      [nzDropdownMenu]="userMenu"
      (nzVisibleChange)="onUserMenuVisible($event)"
      tabindex="0"
      role="button"
      aria-haspopup="menu"
      aria-label="用户菜单"
    >
      <nz-avatar [nzSrc]="user.avatar" nzSize="small" class="mr-sm" />
      <span class="header-user-name">{{ user.name }}</span>
      <nz-icon nzType="down" class="header-user-chevron" />
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <ul nz-menu class="header-user-menu">
        <li nz-menu-item routerLink="/pro/account/center">
          <span class="header-user-menu-item-inner">
            <nz-icon nzType="user" />
            <span>个人中心</span>
          </span>
        </li>
        <li nz-menu-divider></li>
        <li nz-menu-item (click)="logout()">
          <span class="header-user-menu-item-inner">
            <nz-icon nzType="logout" />
            <span>退出登录</span>
          </span>
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  styleUrl: './user.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NzDropdownModule, NzMenuModule, NzIconModule, NzAvatarModule]
})
export class HeaderUserComponent {
  private readonly settings = inject(SettingsService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly userTrigger = viewChild.required<ElementRef<HTMLElement>>('userTrigger');

  /** 下拉层宽度与顶栏触发区域（图2）一致 */
  userMenuOverlayStyle: Record<string, string> = {};

  get user(): User {
    return this.settings.user;
  }

  onUserMenuVisible(visible: boolean): void {
    if (!visible) return;
    queueMicrotask(() => {
      const el = this.userTrigger().nativeElement;
      const w = el.getBoundingClientRect().width;
      this.userMenuOverlayStyle = {
        width: `${w}px`,
        minWidth: `${w}px`,
        maxWidth: `${w}px`,
        boxSizing: 'border-box'
      };
      this.cdr.markForCheck();
    });
  }

  logout(): void {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
  }
}
