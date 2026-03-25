import { Injectable, signal, computed } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { LoginService } from '../core/services/login.service';
import type { UserInfoResult, SysUser } from '../core/types/api/login';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userInfo = signal<UserInfoResult | null>(null);

  user = computed(() => this.userInfo()?.user ?? null);
  roles = computed(() => this.userInfo()?.roles ?? []);
  permissions = computed(() => this.userInfo()?.permissions ?? []);

  constructor(
    private auth: AuthService,
    private loginService: LoginService
  ) {}

  login(username: string, password: string, code: string, uuid: string) {
    return this.loginService.login(username, password, code, uuid);
  }

  getInfo() {
    return this.loginService.getInfo().subscribe({
      next: (res) => this.userInfo.set(res),
      error: () => this.logout()
    });
  }

  logout() {
    this.loginService.logout().subscribe({
      complete: () => {
        this.auth.removeToken();
        this.userInfo.set(null);
        window.location.href = '/login';
      }
    });
  }

  hasRole(role: string): boolean {
    const roles = this.roles();
    return roles.includes('admin') || roles.includes(role);
  }

  hasPermi(permission: string): boolean {
    const perms = this.permissions();
    return perms.includes('*:*:*') || perms.includes(permission);
  }
}
