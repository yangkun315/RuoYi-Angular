import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PermissionService } from '../../../services/permission.service';
import type { RouterVo } from '../../../core/types/api/menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NzMenuModule, NzIconModule, RouterLink, RouterLinkActive],
  template: `
    <ul nz-menu nzMode="inline" [nzInlineCollapsed]="collapsed()" class="sidebar-menu">
      <li nz-menu-item>
        <a routerLink="/" routerLinkActive="ant-menu-item-selected" [routerLinkActiveOptions]="{ exact: true }">
          <span nz-icon nzType="home"></span>
          <span>首页</span>
        </a>
      </li>
      @for (route of permissionService.sidebarRoutes(); track route.path) {
        @if (route.children && route.children.length) {
          @for (child of route.children; track child.path) {
            @if (!child.hidden) {
              <li nz-menu-item>
                <a [routerLink]="getChildPath(route, child)" routerLinkActive="ant-menu-item-selected">
                  {{ child.meta?.title || child.path }}
                </a>
              </li>
            }
          }
        }
      }
    </ul>
  `
})
export class SidebarComponent {
  permissionService = inject(PermissionService);
  collapsed = input<boolean>(false);

  getChildPath(parent: RouterVo, child: RouterVo): string {
    const p = (parent.path || '').replace(/^\//, '');
    const c = (child.path || '').replace(/^\//, '');
    return '/' + (p ? p + '/' : '') + c;
  }
}
