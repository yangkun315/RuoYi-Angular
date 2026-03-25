import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFooterModule } from '@delon/abc/global-footer';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { HeaderI18nComponent } from '../basic/widgets/i18n.component';

@Component({
  selector: 'layout-passport',
  template: `
    <div class="container">
      <div class="langs">
        <header-i18n [showLangText]="true" />
      </div>
      <div class="wrap">
        <div class="top">
          <div class="head">
            <span class="title">若依管理系统</span>
          </div>
        </div>
        <router-outlet />
        <global-footer [links]="links">
          Copyright
          <i class="anticon anticon-copyright"></i> 2025
          <a href="//github.com/cipchk" target="_blank">卡色</a>出品
        </global-footer>
      </div>
    </div>
  `,
  styleUrls: ['./passport.component.less'],
  imports: [RouterOutlet, GlobalFooterModule, NzIconModule, HeaderI18nComponent]
})
export class LayoutPassportComponent implements OnInit {
  private tokenService = inject(DA_SERVICE_TOKEN);

  links = [
    {
      title: '帮助',
      href: ''
    },
    {
      title: '隐私',
      href: ''
    },
    {
      title: '条款',
      href: ''
    }
  ];

  ngOnInit(): void {
    this.tokenService.clear();
  }
}
