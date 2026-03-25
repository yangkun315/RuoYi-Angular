import type { PageDomain, BaseEntity, AjaxResult, TableDataInfo } from '../common';

export interface ConfigQueryParams extends PageDomain {
  configName?: string;
  configKey?: string;
  configType?: string;
}

export interface SysConfig extends BaseEntity {
  configId?: number;
  configName?: string;
  configKey?: string;
  configValue?: string;
  configType?: 'Y' | 'N';
  status?: '0' | '1';
}
