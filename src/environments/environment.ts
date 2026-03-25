// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from '@delon/theme';

/**
 * RuoYi 后端 API 配置
 * 开发环境 /dev-api 由 proxy.conf.js 代理到 localhost:8080
 */
export const environment = {
  production: false,
  useHash: false,
  api: {
    baseUrl: '/dev-api',
    refreshTokenEnabled: false,
    refreshTokenType: 'auth-refresh'
  },
  /** 表单构建器（外链），与若依「表单构建」菜单一致 */
  formBuilderUrl: 'https://mrhj.gitee.io/form-generator/#/',
  providers: [],
  interceptorFns: []
} as Environment & { formBuilderUrl?: string };
