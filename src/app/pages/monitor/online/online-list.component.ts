import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnlineApi } from '../../../api/monitor/online.api';
import type { OnlineQueryParams, SysUserOnline } from '../../../core/types/api/monitor/online';
import { normalizeTableDataInfo } from '../../../shared/ruoyi/ruoyi-list.utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-online-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzModalModule,
    NzTooltipModule
  ],
  templateUrl: './online-list.component.html'
})
export class OnlineListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(OnlineApi);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysUserOnline[] = [];
  loading = false;
  total = 0;
  queryParams: OnlineQueryParams & { pageNum: number; pageSize: number } = {
    pageNum: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.load();
  }

  formatLoginTime(t: number | undefined): string {
    if (t == null) return '';
    const d = new Date(typeof t === 'number' && t < 1e12 ? t * 1000 : t);
    if (Number.isNaN(d.getTime())) return String(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  load(): void {
    this.loading = true;
    this.api.list(this.queryParams).subscribe({
      next: res => {
        const { rows, total } = normalizeTableDataInfo<SysUserOnline>(res);
        this.list = rows;
        this.total = total;
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

  search(): void {
    this.queryParams.pageNum = 1;
    this.load();
  }

  onTableQuery(p: NzTableQueryParams): void {
    this.queryParams.pageNum = p.pageIndex;
    this.queryParams.pageSize = p.pageSize;
    this.load();
  }

  forceLogout(row: SysUserOnline): void {
    if (!row.tokenId) return;
    this.modal.confirm({
      nzTitle: '确认强退',
      nzContent: `是否确认强退用户「${row.userName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.forceLogout(row.tokenId!).subscribe({
            next: () => {
              this.msg.success('强退成功');
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }
}
