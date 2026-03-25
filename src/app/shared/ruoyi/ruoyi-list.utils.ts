function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDateParam(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 若依列表查询常用：日期范围写入 params.beginTime / endTime */
export function withDateRange<T extends { params?: { beginTime?: string; endTime?: string } }>(
  query: T,
  range: [Date, Date] | null
): T {
  const next = { ...query, params: { ...query.params } };
  if (range?.[0] && range[1]) {
    next.params = {
      ...next.params,
      beginTime: formatDateParam(range[0]),
      endTime: formatDateParam(range[1])
    };
  } else {
    if (next.params) {
      delete next.params.beginTime;
      delete next.params.endTime;
    }
  }
  return next;
}

export function toUrlEncoded(obj: Record<string, unknown>): string {
  const p = new URLSearchParams();
  const walk = (prefix: string, val: unknown): void => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      val.forEach((v, i) => walk(`${prefix}[${i}]`, v));
      return;
    }
    if (typeof val === 'object') {
      Object.entries(val as Record<string, unknown>).forEach(([k, v]) => walk(prefix ? `${prefix}.${k}` : k, v));
      return;
    }
    p.append(prefix, String(val));
  };
  Object.entries(obj).forEach(([k, v]) => walk(k, v));
  return p.toString();
}

/** 扁平列表按 parentId 建树（parentId 为 0 或缺失视为根） */
export function buildTreeFromFlat<T extends Record<string, unknown>>(
  items: T[],
  opts: { idKey: keyof T; parentKey: keyof T; childrenKey: string }
): T[] {
  const { idKey, parentKey, childrenKey } = opts;
  type Node = T & Record<string, unknown>;
  const map = new Map<number, Node>();
  for (const item of items) {
    const id = item[idKey] as number;
    map.set(id, { ...item, [childrenKey]: [] });
  }
  const roots: T[] = [];
  for (const item of items) {
    const id = item[idKey] as number;
    const pid = (item[parentKey] as number) ?? 0;
    const node = map.get(id)!;
    if (!pid || pid === 0) roots.push(node as T);
    else {
      const parent = map.get(pid);
      if (parent) ((parent[childrenKey] as unknown) as T[]).push(node as T);
      else roots.push(node as T);
    }
  }
  const sortRec = (nodes: T[]) => {
    nodes.sort(
      (a, b) =>
        Number((a as Record<string, unknown>)['orderNum'] ?? 0) -
        Number((b as Record<string, unknown>)['orderNum'] ?? 0)
    );
    for (const n of nodes) {
      const ch = (n as Record<string, unknown>)[childrenKey] as T[] | undefined;
      if (ch?.length) sortRec(ch);
    }
  };
  sortRec(roots);
  return roots;
}

/** 树拍平为表格行，带缩进深度 _depth */
export function flattenTreeForTable<T extends { children?: T[] }>(
  nodes: T[],
  depth = 0,
  orderKey: keyof T = 'orderNum' as keyof T
): Array<T & { _depth: number }> {
  const sorted = [...nodes].sort(
    (a, b) => Number((a as Record<string, unknown>)[orderKey as string] ?? 0) - Number((b as Record<string, unknown>)[orderKey as string] ?? 0)
  );
  const out: Array<T & { _depth: number }> = [];
  for (const n of sorted) {
    out.push({ ...n, _depth: depth } as T & { _depth: number });
    if (n.children?.length) out.push(...flattenTreeForTable(n.children, depth + 1, orderKey));
  }
  return out;
}

/**
 * 统一解析若依分页接口：支持顶层 { rows, total }，或包在 data 内 { data: { rows, total } }，
 * 少数版本为 { data: T[], total }。
 */
export function normalizeTableDataInfo<T>(res: unknown): { rows: T[]; total: number } {
  if (res == null || typeof res !== 'object') {
    return { rows: [], total: 0 };
  }
  const r = res as Record<string, unknown>;
  const totalTop = r['total'];
  const rowsTop = r['rows'];
  if (Array.isArray(rowsTop)) {
    return { rows: rowsTop as T[], total: Number(totalTop ?? 0) };
  }
  const d = r['data'];
  if (d != null && typeof d === 'object' && !Array.isArray(d)) {
    const dd = d as Record<string, unknown>;
    if (Array.isArray(dd['rows'])) {
      return { rows: dd['rows'] as T[], total: Number(dd['total'] ?? totalTop ?? 0) };
    }
  }
  if (Array.isArray(d)) {
    const arr = d as T[];
    return { rows: arr, total: Number(totalTop ?? arr.length) };
  }
  return { rows: [], total: Number(totalTop ?? 0) };
}

