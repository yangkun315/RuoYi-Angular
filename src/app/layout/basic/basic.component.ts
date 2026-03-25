import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SettingsService, User } from '@delon/theme';
import { LayoutDefaultModule, LayoutDefaultOptions } from '@delon/theme/layout-default';
import { PageHeaderModule } from '@delon/abc/page-header';
import { SettingDrawerModule } from '@delon/theme/setting-drawer';
import { ThemeBtnComponent } from '@delon/theme/theme-btn';
import { environment } from '@env/environment';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { HeaderClearStorageComponent } from './widgets/clear-storage.component';
import { HeaderFullScreenComponent } from './widgets/fullscreen.component';
import { HeaderI18nComponent } from './widgets/i18n.component';
import { HeaderNoticeCenterPanelComponent } from './widgets/header-notice-center-panel.component';
import { HeaderNotificationsPanelComponent } from './widgets/header-notifications-panel.component';
import { HeaderSearchComponent } from './widgets/search.component';
import { HeaderUserComponent } from './widgets/user.component';

@Component({
  selector: 'layout-basic',
  template: `
    <ng-template #headerNoticeCenterPopover>
      <header-notice-center-panel [embedded]="true" />
    </ng-template>
    <ng-template #headerNotificationsPopover>
      <header-notifications-panel [embedded]="true" />
    </ng-template>

    <layout-default [options]="options" [asideUser]="asideUserTpl" [content]="contentTpl" [customError]="null">
      <layout-default-header-item direction="left" hidden="mobile">
        <a layout-default-header-item-trigger routerLink="/passport/lock">
          <nz-icon nzType="lock" />
        </a>
      </layout-default-header-item>
      <layout-default-header-item direction="left" hidden="pc">
        <div layout-default-header-item-trigger (click)="searchToggleStatus = !searchToggleStatus">
          <nz-icon nzType="search" />
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="middle">
        <header-search class="alain-default__search" [toggleChange]="searchToggleStatus" />
      </layout-default-header-item>
      <layout-default-header-item direction="right">
        <div
          layout-default-header-item-trigger
          class="header-bell-wrap"
          nz-popover
          [nzPopoverContent]="headerNoticeCenterPopover"
          nzPopoverTrigger="click"
          nzPopoverPlacement="bottomRight"
          nzPopoverOverlayClassName="header-bell-popover"
          tabindex="0"
          role="button"
          aria-label="消息通知"
        >
          <nz-badge [nzCount]="5" nzSize="small" [nzOverflowCount]="99">
            <span class="header-bell-host"><nz-icon nzType="bell" /></span>
          </nz-badge>
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="right">
        <div
          layout-default-header-item-trigger
          class="header-bell-wrap"
          nz-popover
          [nzPopoverContent]="headerNotificationsPopover"
          nzPopoverTrigger="click"
          nzPopoverPlacement="bottomRight"
          nzPopoverOverlayClassName="header-bell-popover"
          tabindex="0"
          role="button"
          aria-label="Notifications"
        >
          <nz-badge nzDot>
            <span class="header-bell-host"><nz-icon nzType="bell" nzTheme="outline" /></span>
          </nz-badge>
        </div>
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <span layout-default-header-item-trigger class="header-app-grid-decoy" aria-hidden="true">
          <nz-icon nzType="appstore" />
        </span>
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <header-i18n [showLangText]="false" />
      </layout-default-header-item>
      <layout-default-header-item direction="right" hidden="mobile">
        <div layout-default-header-item-trigger nz-dropdown [nzDropdownMenu]="settingsMenu" nzTrigger="click" nzPlacement="bottomRight">
          <nz-icon nzType="setting" />
        </div>
        <nz-dropdown-menu #settingsMenu="nzDropdownMenu">
          <div nz-menu style="width: 200px;">
            <div nz-menu-item>
              <header-fullscreen />
            </div>
            <div nz-menu-item>
              <header-clear-storage />
            </div>
          </div>
        </nz-dropdown-menu>
      </layout-default-header-item>
      <layout-default-header-item direction="right">
        <header-user />
      </layout-default-header-item>
      <ng-template #asideUserTpl>
        <a routerLink="/pro/account/center" class="alain-default__aside-user alain-default__aside-user--link">
          <nz-avatar class="alain-default__aside-user-avatar" [nzSrc]="user.avatar" />
          <div class="alain-default__aside-user-info">
            <strong>{{ user.name }}</strong>
            <p class="mb0">{{ user.email }}</p>
          </div>
        </a>
      </ng-template>
      <ng-template #contentTpl>
        <page-header />
        <router-outlet />
      </ng-template>
    </layout-default>
    @if (showSettingDrawer) {
      <setting-drawer />
    }
    <theme-btn />
  `,
  imports: [
    RouterOutlet,
    RouterLink,
    LayoutDefaultModule,
    PageHeaderModule,
    SettingDrawerModule,
    ThemeBtnComponent,
    NzBadgeModule,
    NzIconModule,
    NzMenuModule,
    NzDropdownModule,
    NzPopoverModule,
    NzAvatarModule,
    HeaderNoticeCenterPanelComponent,
    HeaderNotificationsPanelComponent,
    HeaderSearchComponent,
    HeaderClearStorageComponent,
    HeaderFullScreenComponent,
    HeaderI18nComponent,
    HeaderUserComponent
  ]
})
export class LayoutBasicComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  options: LayoutDefaultOptions = {
    logoExpanded: `./assets/logo-full.svg`,
    logoCollapsed: `./assets/logo.svg`,
    logoLink: `/dashboard/welcome`,
    showHeaderCollapse: true,
    showSiderCollapse: false
  };
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;
  get user(): User {
    return this.settings.user;
  }

  ngOnInit(): void {
    // ng-alain LayoutDefaultService：构造函数里 checkMedia() 先于 notify 订阅，会丢掉首次 setLayout，折叠图标 nzType 为空
    queueMicrotask(() => {
      this.settings.setLayout('collapsed', this.settings.layout.collapsed);
    });
  }
}
