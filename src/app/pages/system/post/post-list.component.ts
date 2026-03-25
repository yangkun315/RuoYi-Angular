import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostApi } from '../../../api/system/post.api';
import type { PostQueryParams, SysPost } from '../../../core/types/api/system/post';
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
  selector: 'app-post-list',
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
  templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(PostApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysPost[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  queryParams: PostQueryParams & { pageNum: number; pageSize: number } = {
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
  form: Partial<SysPost> = {};

  get singleDisabled(): boolean {
    return this.checkedIds.size !== 1;
  }
  get multipleDisabled(): boolean {
    return this.checkedIds.size === 0;
  }

  ngOnInit(): void {
    this.load();
  }

  buildQuery(): PostQueryParams & { pageNum: number; pageSize: number } {
    return { ...this.queryParams };
  }

  load(): void {
    this.loading = true;
    this.api.listPost(this.buildQuery()).subscribe({
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
    const pageIds = new Set(this.list.map(r => r.postId!).filter(Boolean));
    const checkedOnPage = [...this.checkedIds].filter(id => pageIds.has(id));
    this.allChecked = pageIds.size > 0 && checkedOnPage.length === pageIds.size;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageIds.size;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(r => {
      if (r.postId != null) {
        if (checked) this.checkedIds.add(r.postId);
        else this.checkedIds.delete(r.postId);
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

  emptyForm(): Partial<SysPost> {
    return { postCode: '', postName: '', postSort: 0, status: '0', remark: '' };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '添加岗位';
    this.modalOpen = true;
  }

  openEdit(row?: SysPost): void {
    const id = row?.postId ?? [...this.checkedIds][0];
    if (id == null) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.api.getPost(id).subscribe({
      next: res => {
        this.form = { ...(res.data ?? {}) };
        this.modalTitle = '修改岗位';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载岗位失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = this.emptyForm();
  }

  submitModal(): void {
    const f = this.form;
    if (!f.postCode?.trim() || !f.postName?.trim()) {
      this.msg.error('请填写岗位编码与岗位名称');
      return;
    }
    this.modalLoading = true;
    const req = f.postId != null ? this.api.updatePost(f as SysPost) : this.api.addPost(f as SysPost);
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

  removeOne(row: SysPost): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除岗位「${row.postName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delPost(row.postId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.checkedIds.delete(row.postId!);
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
      this.msg.warning('请选择要删除的岗位');
      return;
    }
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除选中的 ${ids.length} 条岗位？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delPost(ids).subscribe({
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
      .post('/system/post/export', body, {
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
          let name = `post_${Date.now()}.xlsx`;
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
