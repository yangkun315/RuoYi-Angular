import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DictDataApi } from '../../../api/system/dict-data.api';
import type { DictDataQueryParams, SysDictData } from '../../../core/types/api/system/dict';
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
  selector: 'app-dict-data-list',
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
    NzModalModule,
    NzIconModule,
    NzDividerModule,
    NzRadioModule,
    NzTooltipModule,
    NzTagModule
  ],
  templateUrl: './dict-data-list.component.html'
})
export class DictDataListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DictDataApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  dictType = '';
  list: SysDictData[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  queryParams: DictDataQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  statusDict = [
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ];

  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;

  modalOpen = false;
  modalTitle = '';
  modalLoading = false;
  form: Partial<SysDictData> = {};

  get singleDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }
  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      this.dictType = pm.get('dictType') ?? '';
      this.queryParams.dictType = this.dictType;
      if (this.dictType) this.load();
      else {
        this.list = [];
        this.msg.warning('缺少字典类型');
      }
    });
  }

  buildQuery(): DictDataQueryParams & { pageNum: number; pageSize: number } {
    return { ...this.queryParams, dictType: this.dictType };
  }

  load(): void {
    if (!this.dictType) return;
    this.loading = true;
    this.api.listData(this.buildQuery()).subscribe({
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
    this.queryParams = {
      dictType: this.dictType,
      pageNum: 1,
      pageSize: this.queryParams.pageSize ?? 10
    };
    this.load();
  }

  onTableQuery(p: NzTableQueryParams): void {
    this.queryParams.pageNum = p.pageIndex;
    this.queryParams.pageSize = p.pageSize;
    this.load();
  }

  refreshCheckState(): void {
    const pageIds = new Set(this.list.map(r => r.dictCode!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.dictCode != null) {
        if (checked) this.checkedIds.add(r.dictCode);
        else this.checkedIds.delete(r.dictCode);
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

  emptyForm(): Partial<SysDictData> {
    return {
      dictType: this.dictType,
      dictLabel: '',
      dictValue: '',
      dictSort: 0,
      isDefault: 'N',
      status: '0',
      remark: ''
    };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '添加字典数据';
    this.modalOpen = true;
  }

  openEdit(row?: SysDictData): void {
    const id = row?.dictCode ?? [...this.checkedIds][0];
    if (id == null) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.api.getData(id).subscribe({
      next: res => {
        this.form = { ...(res.data ?? {}), dictType: this.dictType };
        this.modalTitle = '修改字典数据';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = {};
  }

  submitModal(): void {
    const f = this.form;
    if (!f.dictLabel?.trim() || !f.dictValue?.trim()) {
      this.msg.error('请填写数据标签与键值');
      return;
    }
    f.dictType = this.dictType;
    this.modalLoading = true;
    const req = f.dictCode != null ? this.api.updateData(f as SysDictData) : this.api.addData(f as SysDictData);
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

  removeOne(row: SysDictData): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除「${row.dictLabel}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delData(row.dictCode!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.dictCode!);
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
      this.msg.warning('请选择要删除的数据');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条数据？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delData(ids).subscribe({
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
      .post('/system/dict/data/export', body, {
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
          let name = `dict_data_${Date.now()}.xlsx`;
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
