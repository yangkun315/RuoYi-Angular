import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobApi } from '../../../api/monitor/job.api';
import type { JobQueryParams, SysJob } from '../../../core/types/api/monitor/job';
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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzSwitchModule,
    NzModalModule,
    NzIconModule,
    NzDividerModule,
    NzRadioModule,
    NzTooltipModule
  ],
  templateUrl: './job-list.component.html'
})
export class JobListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(JobApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysJob[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  queryParams: JobQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  jobGroups = ['DEFAULT', 'SYSTEM'];
  statusDict = [
    { label: '正常', value: '0' },
    { label: '暂停', value: '1' }
  ];

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  modalOpen = false;
  modalTitle = '';
  modalLoading = false;
  form: Partial<SysJob> = {};

  get singleDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }
  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  ngOnInit(): void {
    this.load();
  }

  buildQuery(): JobQueryParams & { pageNum: number; pageSize: number } {
    return { ...this.queryParams };
  }

  load(): void {
    this.loading = true;
    this.api.listJob(this.buildQuery()).subscribe({
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
    const pageIds = new Set(this.list.map(r => r.jobId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.jobId != null) {
        if (checked) this.checkedIds.add(r.jobId);
        else this.checkedIds.delete(r.jobId);
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

  emptyForm(): Partial<SysJob> {
    return {
      jobName: '',
      jobGroup: 'DEFAULT',
      invokeTarget: '',
      cronExpression: '',
      misfirePolicy: '3',
      concurrent: '1',
      status: '0'
    };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '添加任务';
    this.modalOpen = true;
  }

  openEdit(row?: SysJob): void {
    const id = row?.jobId ?? [...this.checkedIds][0];
    if (id == null) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.api.getJob(id).subscribe({
      next: res => {
        this.form = { ...(res.data ?? {}) };
        this.modalTitle = '修改任务';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载任务失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = this.emptyForm();
  }

  submitModal(): void {
    const f = this.form;
    if (!f.jobName?.trim() || !f.invokeTarget?.trim() || !f.cronExpression?.trim()) {
      this.msg.error('请填写任务名称、调用目标与 cron');
      return;
    }
    this.modalLoading = true;
    const req = f.jobId != null ? this.api.updateJob(f as SysJob) : this.api.addJob(f as SysJob);
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

  onStatusChange(row: SysJob, on: boolean): void {
    const next = on ? '0' : '1';
    const prev = row.status;
    this.modal.confirm({
      nzTitle: '确认操作',
      nzContent: `确认要「${on ? '启用' : '暂停'}」任务「${row.jobName}」吗？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.changeJobStatus(row.jobId!, next).subscribe({
            next: () => {
              row.status = next as '0' | '1';
              this.msg.success('操作成功');
              resolve();
            },
            error: () => {
              row.status = prev;
              reject();
            }
          });
        })
    });
  }

  runOne(row: SysJob): void {
    if (row.jobId == null || !row.jobGroup) return;
    this.modal.confirm({
      nzTitle: '确认执行',
      nzContent: `确认立即执行一次「${row.jobName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.runJob(row.jobId!, row.jobGroup!).subscribe({
            next: () => {
              this.msg.success('执行成功');
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  runChecked(): void {
    const id = [...this.checkedIds][0];
    const row = this.list.find(r => r.jobId === id);
    if (row) this.runOne(row);
  }

  removeOne(row: SysJob): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除任务「${row.jobName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delJob(row.jobId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.jobId!);
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
      this.msg.warning('请选择要删除的任务');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条任务？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delJob(ids).subscribe({
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
      .post('/monitor/job/export', body, {
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
          let name = `job_${Date.now()}.xlsx`;
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
