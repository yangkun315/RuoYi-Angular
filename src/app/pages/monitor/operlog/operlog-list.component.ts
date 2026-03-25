import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperlogApi } from '../../../api/monitor/operlog.api';
import type { OperlogQueryParams, SysOperLog } from '../../../core/types/api/monitor/operlog';
import { toUrlEncoded, withDateRange } from '../../../shared/ruoyi/ruoyi-list.utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-operlog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCheckboxModule,
    NzModalModule,
    NzIconModule,
    NzDividerModule,
    NzTagModule,
    NzTooltipModule,
    NzDescriptionsModule
  ],
  templateUrl: './operlog-list.component.html'
})
export class OperlogListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(OperlogApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysOperLog[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  dateRange: [Date, Date] | null = null;
  queryParams: OperlogQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  businessTypes = [
    { label: '其它', value: 0 },
    { label: '新增', value: 1 },
    { label: '修改', value: 2 },
    { label: '删除', value: 3 },
    { label: '授权', value: 4 },
    { label: '导出', value: 5 },
    { label: '导入', value: 6 },
    { label: '强退', value: 7 },
    { label: '生成代码', value: 8 },
    { label: '清空数据', value: 9 }
  ];

  statusDict = [
    { label: '正常', value: '0' },
    { label: '异常', value: '1' }
  ];

  /** 与 nz-select 绑定，空串表示不限 */
  businessTypeModel: number | '' = '';

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  detailOpen = false;
  detailRow: SysOperLog | null = null;

  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  ngOnInit(): void {
    this.load();
  }

  businessTypeLabel(v: number | undefined): string {
    const x = this.businessTypes.find(t => t.value === v);
    return x?.label ?? String(v ?? '');
  }

  buildQuery(): OperlogQueryParams & { pageNum: number; pageSize: number } {
    const q = withDateRange({ ...this.queryParams }, this.dateRange) as OperlogQueryParams & {
      pageNum: number;
      pageSize: number;
    };
    if (this.businessTypeModel === '' || this.businessTypeModel === null) {
      delete q.businessType;
    } else {
      q.businessType = Number(this.businessTypeModel);
    }
    return q;
  }

  load(): void {
    this.loading = true;
    this.api.list(this.buildQuery()).subscribe({
      next: res => {
        this.list = res.rows ?? [];
        this.total = res.total ?? 0;
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
    this.businessTypeModel = '';
    this.load();
  }

  onTableQuery(p: NzTableQueryParams): void {
    this.queryParams.pageNum = p.pageIndex;
    this.queryParams.pageSize = p.pageSize;
    this.load();
  }

  refreshCheckState(): void {
    const pageIds = new Set(this.list.map(r => r.operId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.operId != null) {
        if (checked) this.checkedIds.add(r.operId);
        else this.checkedIds.delete(r.operId);
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

  openDetail(row: SysOperLog): void {
    this.detailRow = row;
    this.detailOpen = true;
  }

  removeOne(row: SysOperLog): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: '是否确认删除该日志？',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delOperlog(row.operId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.operId!);
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
      this.msg.warning('请选择要删除的日志');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条日志？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delOperlog(ids).subscribe({
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

  cleanAll(): void {
    this.modal.confirm({
      nzTitle: '确认清空',
      nzContent: '是否确认清空所有操作日志？',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.cleanOperlog().subscribe({
            next: () => {
              this.msg.success('清空成功');
              this.checkedIds.clear();
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  export(): void {
    const body = toUrlEncoded(this.buildQuery() as unknown as Record<string, unknown>);
    this.http
      .post('/monitor/operlog/export', body, {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }),
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: resp => {
          const blob = resp.body;
          if (!blob) {
            this.msg.error('导出失败');
            return;
          }
          let name = `operlog_${Date.now()}.xlsx`;
          const cd = resp.headers.get('content-disposition');
          if (cd) {
            const m = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(cd);
            const raw = decodeURIComponent(m?.[1] || m?.[2] || '');
            if (raw) name = raw;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.click();
          URL.revokeObjectURL(url);
          this.msg.success('导出成功');
        },
        error: () => this.msg.error('导出失败')
      });
  }
}
