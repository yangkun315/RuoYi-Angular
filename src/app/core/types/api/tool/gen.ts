import type { PageDomain, BaseEntity } from '../common';

export interface GenQueryParams extends PageDomain {
  tableName?: string;
  tableComment?: string;
  params?: { beginTime?: string; endTime?: string };
}

export interface GenTableColumn extends BaseEntity {
  columnId?: number;
  tableId?: number;
  columnName?: string;
  columnComment?: string;
  columnType?: string;
  javaType?: string;
  javaField?: string;
  isPk?: '1' | '0';
  isIncrement?: '1' | '0';
  isRequired?: '1' | '0';
  isInsert?: '1' | '0';
  isEdit?: '1' | '0';
  isList?: '1' | '0';
  isQuery?: '1' | '0';
  queryType?: 'EQ' | 'NE' | 'GT' | 'LT' | 'LIKE' | 'BETWEEN';
  htmlType?: string;
  dictType?: string;
  sort?: number;
}

export interface GenTable extends BaseEntity {
  tableId?: number;
  tableName?: string;
  tableComment?: string;
  subTableName?: string;
  subTableFkName?: string;
  className?: string;
  tplCategory?: 'crud' | 'tree' | 'sub';
  tplWebType?: 'element-ui' | 'element-plus';
  packageName?: string;
  moduleName?: string;
  businessName?: string;
  functionName?: string;
  functionAuthor?: string;
  genType?: '0' | '1';
  genPath?: string;
  options?: string;
  treeCode?: string;
  treeParentCode?: string;
  treeName?: string;
  parentMenuId?: string;
  parentMenuName?: string;
  columns?: GenTableColumn[];
}

export interface GenTableInfoResult {
  info: GenTable;
  rows: GenTableColumn[];
  tables: GenTable[];
}
