import { Routes } from '@angular/router';
import { startPageGuard } from '@core';
import { authSimpleCanActivate, authSimpleCanActivateChild } from '@delon/auth';

import { LayoutBasicComponent } from '../layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [startPageGuard, authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    data: {},
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard-shell.component').then((m) => m.DashboardShellComponent),
        data: { title: '仪表盘' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'welcome' },
          {
            path: 'welcome',
            loadComponent: () =>
              import('./dashboard/welcome/dashboard-welcome.component').then(
                (m) => m.DashboardWelcomeComponent,
              ),
            data: { title: '默认页' },
          },
          {
            path: 'analysis',
            loadComponent: () =>
              import('./dashboard/analysis/dashboard-analysis.component').then(
                (m) => m.DashboardAnalysisComponent,
              ),
            data: { title: '分析页' },
          },
          {
            path: 'monitor',
            loadComponent: () =>
              import('./dashboard/monitor/dashboard-monitor.component').then(
                (m) => m.DashboardMonitorComponent,
              ),
            data: { title: '监控页' },
          },
        ],
      },
      // RuoYi 系统管理
      {
        path: 'system/user',
        loadComponent: () =>
          import('../pages/system/user/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'system/role',
        loadComponent: () =>
          import('../pages/system/role/role-list.component').then((m) => m.RoleListComponent),
      },
      {
        path: 'system/menu',
        loadComponent: () =>
          import('../pages/system/menu/menu-list.component').then((m) => m.MenuListComponent),
      },
      {
        path: 'system/dept',
        loadComponent: () =>
          import('../pages/system/dept/dept-list.component').then((m) => m.DeptListComponent),
      },
      {
        path: 'system/post',
        loadComponent: () =>
          import('../pages/system/post/post-list.component').then((m) => m.PostListComponent),
      },
      {
        path: 'system/dict/data/:dictType',
        loadComponent: () =>
          import('../pages/system/dict/dict-data-list.component').then(
            (m) => m.DictDataListComponent,
          ),
      },
      {
        path: 'system/dict',
        loadComponent: () =>
          import('../pages/system/dict/dict-list.component').then((m) => m.DictListComponent),
      },
      {
        path: 'system/config',
        loadComponent: () =>
          import('../pages/system/config/config-list.component').then((m) => m.ConfigListComponent),
      },
      {
        path: 'system/notice',
        loadComponent: () =>
          import('../pages/system/notice/notice-list.component').then((m) => m.NoticeListComponent),
      },
      // RuoYi 监控
      {
        path: 'monitor/online',
        loadComponent: () =>
          import('../pages/monitor/online/online-list.component').then(
            (m) => m.OnlineListComponent,
          ),
      },
      {
        path: 'monitor/job',
        loadComponent: () =>
          import('../pages/monitor/job/job-list.component').then((m) => m.JobListComponent),
      },
      {
        path: 'monitor/job-log',
        loadComponent: () =>
          import('../pages/monitor/job-log/job-log-list.component').then(
            (m) => m.JobLogListComponent,
          ),
      },
      {
        path: 'monitor/operlog',
        loadComponent: () =>
          import('../pages/monitor/operlog/operlog-list.component').then(
            (m) => m.OperlogListComponent,
          ),
      },
      {
        path: 'monitor/logininfor',
        loadComponent: () =>
          import('../pages/monitor/logininfor/logininfor-list.component').then(
            (m) => m.LogininforListComponent,
          ),
      },
      {
        path: 'monitor/server',
        loadComponent: () =>
          import('../pages/monitor/server/server.component').then((m) => m.ServerComponent),
      },
      {
        path: 'monitor/cache',
        loadComponent: () =>
          import('../pages/monitor/cache/cache-list.component').then((m) => m.CacheListComponent),
      },
      // RuoYi 工具
      {
        path: 'tool/gen',
        loadComponent: () =>
          import('../pages/tool/gen/gen-list.component').then((m) => m.GenListComponent),
      },
      {
        path: 'tool/build',
        loadComponent: () =>
          import('../pages/tool/build/build.component').then((m) => m.BuildComponent),
      },
      {
        path: 'tool/swagger',
        loadComponent: () =>
          import('../pages/tool/swagger/swagger.component').then((m) => m.SwaggerComponent),
      },
      {
        path: 'notice/inbox',
        loadComponent: () =>
          import('./notice/notice-inbox.component').then((m) => m.NoticeInboxComponent),
        data: { title: '消息通知' },
      },
      {
        path: 'notice/alerts',
        loadComponent: () =>
          import('./notice/notice-alerts.component').then((m) => m.NoticeAlertsComponent),
        data: { title: '预警提醒' },
      },
      {
        path: 'user/profile',
        loadComponent: () =>
          import('../pages/user/profile.component').then((m) => m.ProfileComponent),
        data: { title: '个人中心' },
      },
      /* 与 ng-alain 默认路径一致 */
      {
        path: 'pro/account/center',
        loadComponent: () =>
          import('../pages/user/profile.component').then((m) => m.ProfileComponent),
        data: { title: '个人中心' },
      },
      /* 无顶栏入口，仅保留直链兼容 */
      {
        path: 'pro/account/settings',
        loadComponent: () =>
          import('../pages/user/user-settings.component').then((m) => m.UserSettingsComponent),
        data: { title: '个人设置' },
      },
    ],
  },
  // passport
  { path: '', loadChildren: () => import('./passport/routes').then((m) => m.routes) },
  { path: 'exception', loadChildren: () => import('./exception/routes').then((m) => m.routes) },
  { path: '**', redirectTo: 'exception/404' },
];
