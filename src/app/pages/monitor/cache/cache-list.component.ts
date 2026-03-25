import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CacheApi } from '../../../api/monitor/cache.api';
import type { SysCache } from '../../../core/types/api/monitor/cache';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-cache-list',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSpinModule,
    NzModalModule,
    NzTableModule,
    NzTooltipModule
  ],
  templateUrl: './cache-list.component.html',
  styleUrl: './cache-list.component.less'
})
export class CacheListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(CacheApi);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  /** 表格滚动高度，与若依三栏可视区域接近 */
  readonly tableScrollY = 'calc(100vh - 360px)';

  cacheNames: SysCache[] = [];
  cacheKeys: string[] = [];
  selectedName: string | null = null;
  selectedKey: string | null = null;
  cacheValueDisplay = '请选择左侧缓存与键名';

  namesLoading = false;
  keysLoading = false;
  valueLoading = false;

  ngOnInit(): void {
    this.loadNames();
  }

  loadNames(): void {
    this.namesLoading = true;
    this.api.listCacheName().subscribe({
      next: res => {
        this.cacheNames = (res.data ?? []) as SysCache[];
        this.selectedName = null;
        this.selectedKey = null;
        this.cacheKeys = [];
        this.cacheValueDisplay = '请选择左侧缓存与键名';
      },
      error: () => this.msg.error('加载缓存列表失败'),
      complete: () => {
        this.namesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectCacheName(name: string): void {
    this.selectedName = name;
    this.selectedKey = null;
    this.cacheValueDisplay = '请选择键名';
    this.keysLoading = true;
    this.api.listCacheKey(name).subscribe({
      next: res => {
        this.cacheKeys = (res.data ?? []) as string[];
      },
      error: () => this.msg.error('加载键名失败'),
      complete: () => {
        this.keysLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectKey(key: string): void {
    if (!this.selectedName) return;
    this.selectedKey = key;
    this.valueLoading = true;
    this.api.getCacheValue(this.selectedName, key).subscribe({
      next: res => {
        const v = res.data;
        this.cacheValueDisplay =
          v?.cacheValue != null && v.cacheValue !== ''
            ? String(v.cacheValue)
            : JSON.stringify(v ?? {}, null, 2);
      },
      error: () => {
        this.cacheValueDisplay = '加载失败';
        this.msg.error('加载缓存值失败');
      },
      complete: () => {
        this.valueLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refreshKeys(): void {
    if (this.selectedName) {
      this.selectCacheName(this.selectedName);
    }
  }

  refreshValue(): void {
    if (this.selectedName && this.selectedKey) {
      this.selectKey(this.selectedKey);
    }
  }

  clearCacheNameRow(row: SysCache): void {
    const name = row.cacheName;
    if (!name) return;
    this.modal.confirm({
      nzTitle: '确认清理',
      nzContent: `是否清理缓存「${name}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.clearCacheName(name).subscribe({
            next: () => {
              this.msg.success('已清理');
              if (this.selectedName === name) {
                this.selectedName = null;
                this.selectedKey = null;
                this.cacheKeys = [];
                this.cacheValueDisplay = '请选择左侧缓存与键名';
              }
              this.loadNames();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  clearCacheKeyRow(key: string): void {
    this.modal.confirm({
      nzTitle: '确认清理',
      nzContent: `是否清理键「${key}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.clearCacheKey(key).subscribe({
            next: () => {
              this.msg.success('已清理');
              if (this.selectedKey === key) {
                this.selectedKey = null;
                this.cacheValueDisplay = '请选择键名';
              }
              if (this.selectedName) {
                this.selectCacheName(this.selectedName);
              }
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  clearAll(): void {
    this.modal.confirm({
      nzTitle: '确认清理',
      nzContent: '是否清理全部缓存？',
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.clearCacheAll().subscribe({
            next: () => {
              this.msg.success('已清理全部');
              this.loadNames();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }
}
