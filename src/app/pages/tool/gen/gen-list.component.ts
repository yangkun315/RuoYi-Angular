import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenApi } from '../../../api/tool/gen.api';
import type { GenQueryParams, GenTable } from '../../../core/types/api/tool/gen';
import { normalizeTableDataInfo, withDateRange } from '../../../shared/ruoyi/ruoyi-list.utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-gen-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzModalModule,
    NzIconModule,
    NzDividerModule,
    NzTabsModule,
    NzTooltipModule
  ],
  templateUrl: './gen-list.component.html'
})
export class GenListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(GenApi);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: GenTable[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  dateRange: [Date, Date] | null = null;
  queryParams: GenQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  importOpen = false;
  importLoading = false;
  dbList: GenTable[] = [];
  dbTotal = 0;
  dbLoading = false;
  dbQuery: GenQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };
  importChecked = new Set<string>();

  previewOpen = false;
  previewEntries: [string, string][] = [];

  get singleDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }
  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  trackRow(_: number, row: GenTable): string | number {
    return row.tableId ?? row.tableName ?? _;
  }

  ngOnInit(): void {
    this.load();
  }

  buildQuery(): GenQueryParams & { pageNum: number; pageSize: number } {
    return withDateRange({ ...this.queryParams }, this.dateRange) as GenQueryParams & {
      pageNum: number;
      pageSize: number;
    };
  }

  load(): void {
    this.loading = true;
    this.api.listTable(this.buildQuery()).subscribe({
      next: res => {
        const { rows, total } = normalizeTableDataInfo<GenTable>(res);
        this.list = rows;
        this.total = total;
        this.refreshCheckState();
      },
      error: () => this.msg.error('加载失败'),
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetQuery(): void {
    this.queryParams = { pageNum: 1, pageSize: this.queryParams.pageSize ?? 10 };
    this.dateRange = null;
    this.load();
  }

  /** 搜索时从第一页重新加载（与若依行为一致） */
  search(): void {
    this.queryParams.pageNum = 1;
    this.load();
  }

  onTableQuery(p: NzTableQueryParams): void {
    this.queryParams.pageNum = p.pageIndex;
    this.queryParams.pageSize = p.pageSize;
    this.load();
  }

  refreshCheckState(): void {
    const pageIds = new Set(this.list.map(r => r.tableId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.tableId != null) {
        if (checked) this.checkedIds.add(r.tableId);
        else this.checkedIds.delete(r.tableId);
      }
    });
    this.refreshCheckState();
    this.cdr.markForCheck();
  }

  onCheckOne(id: number, checked: boolean): void {
    if (checked) this.checkedIds.add(id);
    else this.checkedIds.delete(id);
    this.refreshCheckState();
    this.cdr.markForCheck();
  }

  selectedRow(): GenTable | undefined {
    const id = [...this.checkedIds][0];
    return this.list.find(r => r.tableId === id);
  }

  openImport(): void {
    this.importChecked.clear();
    this.dbQuery = { pageNum: 1, pageSize: 10, tableName: '' };
    this.importOpen = true;
    this.loadDb();
  }

  loadDb(): void {
    this.dbLoading = true;
    this.api.listDbTable(this.dbQuery).subscribe({
      next: res => {
        const { rows, total } = normalizeTableDataInfo<GenTable>(res);
        this.dbList = rows;
        this.dbTotal = total;
      },
      error: () => this.msg.error('加载数据库表失败'),
      complete: () => {
        this.dbLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onDbTableQuery(p: NzTableQueryParams): void {
    this.dbQuery.pageNum = p.pageIndex;
    this.dbQuery.pageSize = p.pageSize;
    this.loadDb();
  }

  toggleImportCheck(name: string, checked: boolean): void {
    if (checked) this.importChecked.add(name);
    else this.importChecked.delete(name);
  }

  submitImport(): void {
    const tables = [...this.importChecked];
    if (!tables.length) {
      this.msg.warning('请选择要导入的表');
      return;
    }
    this.importLoading = true;
    this.api.importTable({ tables: tables.join(',') }).subscribe({
      next: () => {
        this.msg.success('导入成功');
        this.importOpen = false;
        this.load();
      },
      error: () => this.msg.error('导入失败'),
      complete: () => {
        this.importLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openPreview(row?: GenTable): void {
    const r = row ?? this.selectedRow();
    if (!r?.tableId) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.api.previewTable(r.tableId).subscribe({
      next: res => {
        const data = res.data;
        const entries: [string, string][] = [];
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
            entries.push([k, typeof v === 'string' ? v : JSON.stringify(v, null, 2)]);
          }
        } else {
          entries.push(['预览', JSON.stringify(data, null, 2)]);
        }
        this.previewEntries = entries;
        this.previewOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('预览失败')
    });
  }

  genCodeOne(row: GenTable): void {
    if (!row.tableName) return;
    this.modal.confirm({
      nzTitle: '生成代码',
      nzContent: `确认生成表「${row.tableName}」的代码？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.genCode(row.tableName!).subscribe({
            next: () => {
              this.msg.success('生成成功');
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  genCodeChecked(): void {
    const r = this.selectedRow();
    if (r) this.genCodeOne(r);
    else this.msg.warning('请选择一条记录');
  }

  synchOne(row: GenTable): void {
    if (!row.tableName) return;
    this.modal.confirm({
      nzTitle: '同步结构',
      nzContent: `确认同步表「${row.tableName}」结构？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.synchDb(row.tableName!).subscribe({
            next: () => {
              this.msg.success('同步成功');
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  synchChecked(): void {
    const r = this.selectedRow();
    if (r) this.synchOne(r);
    else this.msg.warning('请选择一条记录');
  }

  removeOne(row: GenTable): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除「${row.tableName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delTable(row.tableId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.tableId!);
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  batchDelete(): void {
    const ids = [...this.checkedIds];
    if (!ids.length) {
      this.msg.warning('请选择要删除的记录');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条记录？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delTable(ids).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.clear();
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }
}
