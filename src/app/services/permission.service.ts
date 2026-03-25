import { Injectable, signal } from '@angular/core';
import { RouterApi } from '../api/router.api';
import { UserService } from './user.service';
import type { RouterVo } from '../core/types/api/menu';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  sidebarRoutes = signal<RouterVo[]>([]);
  private loaded = false;

  constructor(
    private routerApi: RouterApi,
    private userService: UserService
  ) {}

  loadRoutes(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    return new Promise((resolve) => {
      this.routerApi.getRouters().subscribe({
        next: (res) => {
          const data = (res as { data?: RouterVo[] }).data ?? [];
          this.sidebarRoutes.set(this.filterHidden(data));
          this.loaded = true;
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private filterHidden(routes: RouterVo[]): RouterVo[] {
    return routes
      .filter((r) => !r.hidden)
      .map((r) => ({
        ...r,
        children: r.children?.length ? this.filterHidden(r.children) : undefined
      }));
  }
}
