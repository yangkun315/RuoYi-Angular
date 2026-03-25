import type { PageDomain, BaseEntity, AjaxResult, TableDataInfo } from '../common';

export interface DictTypeQueryParams extends PageDomain {
  dictName?: string;
  dictType?: string;
  status?: string;
  params?: { beginTime?: string; endTime?: string };
}

export interface DictDataQueryParams extends PageDomain {
  dictName?: string;
  dictLabel?: string;
  dictType?: string;
  status?: string;
}

export interface SysDictType extends BaseEntity {
  dictId?: number;
  dictName?: string;
  dictType?: string;
  status?: '0' | '1';
}

export interface SysDictData extends BaseEntity {
  dictCode?: number;
  dictLabel?: string;
  dictValue?: string;
  dictType?: string;
  cssClass?: string;
  listClass?: string;
  dictSort?: number;
  isDefault?: 'Y' | 'N';
  status?: '0' | '1';
}
