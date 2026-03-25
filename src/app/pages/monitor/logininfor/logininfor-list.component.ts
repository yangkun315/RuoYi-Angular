import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogininforApi } from '../../../api/monitor/logininfor.api';
import type { LogininforQueryParams, SysLogininfor } from '../../../core/types/api/monitor/logininfor';
import { toUrlEncoded, withDateRange } from '../../../shared/ruoyi/ruoyi-list.utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
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
  selector: 'app-logininfor-list',
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
    NzTagModule,
    NzTooltipModule
  ],
  templateUrl: './logininfor-list.component.html'
})
export class LogininforListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(LogininforApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysLogininfor[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  dateRange: [Date, Date] | null = null;
  queryParams: LogininforQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  statusDict = [
    { label: '成功', value: '0' },
    { label: '失败', value: '1' }
  ];

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  get unlockDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }

  ngOnInit(): void {
    this.load();
  }

  buildQuery(): LogininforQueryParams & { pageNum: number; pageSize: number } {
    return withDateRange({ ...this.queryParams }, this.dateRange) as LogininforQueryParams & {
      pageNum: number;
      pageSize: number;
    };
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
    this.load();
  }

  onTableQuery(p: NzTableQueryParams): void {
    this.queryParams.pageNum = p.pageIndex;
    this.queryParams.pageSize = p.pageSize;
    this.load();
  }

  refreshCheckState(): void {
    const pageIds = new Set(this.list.map(r => r.infoId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.infoId != null) {
        if (checked) this.checkedIds.add(r.infoId);
        else this.checkedIds.delete(r.infoId);
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

  removeOne(row: SysLogininfor): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: '是否确认删除该登录日志？',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delLogininfor(row.infoId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.infoId!);
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
          this.api.delLogininfor(ids).subscribe({
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
      nzContent: '是否确认清空所有登录日志？',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.cleanLogininfor().subscribe({
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

  unlockChecked(): void {
    const id = [...this.checkedIds][0];
    const row = this.list.find(r => r.infoId === id);
    const name = row?.userName;
    if (!name) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.modal.confirm({
      nzTitle: '账户解锁',
      nzContent: `是否确认解锁用户「${name}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.unlockLogininfor(name).subscribe({
            next: () => {
              this.msg.success('解锁成功');
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
      .post('/monitor/logininfor/export', body, {
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
          let name = `logininfor_${Date.now()}.xlsx`;
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
