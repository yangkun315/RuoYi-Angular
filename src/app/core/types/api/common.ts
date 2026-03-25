/** API 通用响应类型 */
export interface AjaxResult<T = unknown> {
  /** 状态码 */
  code: number;
  /** 返回内容 */
  msg: string;
  /** 数据对象 */
  data?: T;
}

/** API 表格响应类型 */
export interface TableDataInfo<T = unknown> {
  /** 状态码 */
  code: number;
  /** 返回内容 */
  msg: string;
  /** 总记录数 */
  total: number;
  /** 列表数据 */
  rows: T[];
}

/** 分页参数类型 */
export interface PageDomain {
  /** 当前记录起始索引 */
  pageNum?: number;
  /** 每页显示记录数 */
  pageSize?: number;
  /** 排序列 */
  orderByColumn?: string;
  /** 排序的方向desc或者asc */
  isAsc?: string;
  /** 分页参数合理化 */
  reasonable?: boolean;
}

/** Entity基类 */
export interface BaseEntity {
  /** 搜索值 */
  searchValue?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 备注 */
  remark?: string;
  /** 请求参数 */
  params?: Record<string, unknown>;
}

/** Treeselect树结构类型 */
export interface TreeSelect {
  /** 节点ID */
  id?: number;
  /** 节点名称 */
  label?: string;
  /** 节点禁用 */
  disabled: boolean;
  /** 子节点 */
  children: TreeSelect[];
}
