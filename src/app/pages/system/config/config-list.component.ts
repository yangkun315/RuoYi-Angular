import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigApi } from '../../../api/system/config.api';
import type { ConfigQueryParams, SysConfig } from '../../../core/types/api/system/config';
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
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-config-list',
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
    NzTooltipModule
  ],
  templateUrl: './config-list.component.html'
})
export class ConfigListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(ConfigApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysConfig[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  queryParams: ConfigQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  builtInDict = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  modalOpen = false;
  modalTitle = '';
  modalLoading = false;
  form: Partial<SysConfig> = {};

  get isEdit(): boolean {
    return this.form.configId != null;
  }

  get singleDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }
  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  ngOnInit(): void {
    this.load();
  }

  buildQuery(): ConfigQueryParams & { pageNum: number; pageSize: number } {
    return { ...this.queryParams };
  }

  load(): void {
    this.loading = true;
    this.api.listConfig(this.buildQuery()).subscribe({
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
    const pageIds = new Set(this.list.map(r => r.configId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.configId != null) {
        if (checked) this.checkedIds.add(r.configId);
        else this.checkedIds.delete(r.configId);
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

  emptyForm(): Partial<SysConfig> {
    return { configName: '', configKey: '', configValue: '', configType: 'N', remark: '' };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '添加参数';
    this.modalOpen = true;
  }

  openEdit(row?: SysConfig): void {
    const id = row?.configId ?? [...this.checkedIds][0];
    if (id == null) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.api.getConfig(id).subscribe({
      next: res => {
        this.form = { ...(res.data ?? {}) };
        this.modalTitle = '修改参数';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载参数失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = this.emptyForm();
  }

  submitModal(): void {
    const f = this.form;
    if (!f.configName?.trim() || !f.configKey?.trim() || f.configValue === undefined || f.configValue === '') {
      this.msg.error('请填写参数名称、键名与键值');
      return;
    }
    this.modalLoading = true;
    const req = f.configId != null ? this.api.updateConfig(f as SysConfig) : this.api.addConfig(f as SysConfig);
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

  refreshCache(): void {
    this.api.refreshCache().subscribe({
      next: () => this.msg.success('缓存刷新成功'),
      error: () => this.msg.error('缓存刷新失败')
    });
  }

  removeOne(row: SysConfig): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除参数「${row.configName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delConfig(row.configId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.configId!);
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
      this.msg.warning('请选择要删除的参数');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条参数？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delConfig(ids).subscribe({
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
      .post('/system/config/export', body, {
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
          let name = `config_${Date.now()}.xlsx`;
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
