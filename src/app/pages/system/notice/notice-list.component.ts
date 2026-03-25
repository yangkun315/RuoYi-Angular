import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoticeApi } from '../../../api/system/notice.api';
import type { NoticeQueryParams, SysNotice } from '../../../core/types/api/system/notice';
import { toUrlEncoded } from '../../../shared/ruoyi/ruoyi-list.utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-notice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzModalModule,
    NzIconModule,
    NzDividerModule,
    NzRadioModule,
    NzTooltipModule,
    NzTagModule
  ],
  templateUrl: './notice-list.component.html'
})
export class NoticeListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(NoticeApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysNotice[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  queryParams: NoticeQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  typeDict = [
    { label: '通知', value: '1' },
    { label: '公告', value: '2' }
  ];

  statusDict = [
    { label: '正常', value: '0' },
    { label: '关闭', value: '1' }
  ];

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  modalOpen = false;
  modalTitle = '';
  modalLoading = false;
  form: Partial<SysNotice> = {};

  get singleDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }
  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  ngOnInit(): void {
    this.load();
  }

  buildQuery(): NoticeQueryParams & { pageNum: number; pageSize: number } {
    return { ...this.queryParams };
  }

  load(): void {
    this.loading = true;
    this.api.listNotice(this.buildQuery()).subscribe({
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
    this.load();
  }

  onTableQuery(p: NzTableQueryParams): void {
    this.queryParams.pageNum = p.pageIndex;
    this.queryParams.pageSize = p.pageSize;
    this.load();
  }

  refreshCheckState(): void {
    const pageIds = new Set(this.list.map(r => r.noticeId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.noticeId != null) {
        if (checked) this.checkedIds.add(r.noticeId);
        else this.checkedIds.delete(r.noticeId);
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

  emptyForm(): Partial<SysNotice> {
    return { noticeTitle: '', noticeType: '1', status: '0', noticeContent: '' };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '添加公告';
    this.modalOpen = true;
  }

  openEdit(row?: SysNotice): void {
    const id = row?.noticeId ?? [...this.checkedIds][0];
    if (id == null) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.api.getNotice(id).subscribe({
      next: res => {
        this.form = { ...(res.data ?? {}) };
        this.modalTitle = '修改公告';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载公告失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = this.emptyForm();
  }

  submitModal(): void {
    const f = this.form;
    if (!f.noticeTitle?.trim() || !f.noticeType) {
      this.msg.error('请填写公告标题与类型');
      return;
    }
    this.modalLoading = true;
    const req = f.noticeId != null ? this.api.updateNotice(f as SysNotice) : this.api.addNotice(f as SysNotice);
    req.subscribe({
      next: () => {
        this.msg.success('保存成功');
        this.closeModal();
        this.load();
      },
      error: () => this.msg.error('保存失败'),
      complete: () => {
        this.modalLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeOne(row: SysNotice): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除公告「${row.noticeTitle}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delNotice(row.noticeId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.noticeId!);
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
      this.msg.warning('请选择要删除的公告');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条公告？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delNotice(ids).subscribe({
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

  export(): void {
    const body = toUrlEncoded(this.buildQuery() as unknown as Record<string, unknown>);
    this.http
      .post('/system/notice/export', body, {
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
          let name = `notice_${Date.now()}.xlsx`;
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
