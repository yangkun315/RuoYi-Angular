import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeptApi } from '../../../api/system/dept.api';
import type { DeptQueryParams, SysDept } from '../../../core/types/api/system/dept';
import { buildTreeFromFlat } from '../../../shared/ruoyi/ruoyi-list.utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

export type DeptTreeNode = SysDept & {
  expand?: boolean;
  level?: number;
  children?: DeptTreeNode[];
};

@Component({
  selector: 'app-dept-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzIconModule,
    NzDividerModule,
    NzRadioModule,
    NzTagModule
  ],
  templateUrl: './dept-list.component.html',
  styles: [
    `
      .ry-tree-actions a {
        cursor: pointer;
      }
      .ry-tree-actions a:not(.danger-link) {
        color: #1890ff;
      }
    `
  ]
})
export class DeptListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(DeptApi);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  readonly indentUnit = 20;

  treeRoots: DeptTreeNode[] = [];
  visibleList: DeptTreeNode[] = [];
  loading = false;
  showSearch = true;
  allExpanded = false;
  queryParams: DeptQueryParams = {};

  statusDict = [
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ];

  modalOpen = false;
  modalTitle = '';
  modalLoading = false;
  form: Partial<SysDept> = { parentId: 0, orderNum: 0, status: '0' };
  parentOptions: { label: string; value: number }[] = [];

  ngOnInit(): void {
    this.load();
  }

  private normalizeRoots(raw: SysDept[]): DeptTreeNode[] {
    if (!raw?.length) return [];
    const nested = raw.some(d => d.children && d.children.length);
    if (nested) return raw as DeptTreeNode[];
    return buildTreeFromFlat(raw as unknown as Record<string, unknown>[], {
      idKey: 'deptId',
      parentKey: 'parentId',
      childrenKey: 'children'
    }) as DeptTreeNode[];
  }

  private initTreeState(nodes: DeptTreeNode[], expand: boolean): void {
    for (const n of nodes) {
      if (n.children?.length) {
        n.expand = expand;
        this.initTreeState(n.children, expand);
      } else {
        n.expand = false;
      }
    }
  }

  private assignLevels(nodes: DeptTreeNode[], level = 0): void {
    for (const n of nodes) {
      n.level = level;
      if (n.children?.length) this.assignLevels(n.children, level + 1);
    }
  }

  private visibleFlat(nodes: DeptTreeNode[]): DeptTreeNode[] {
    const sorted = [...nodes].sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    const out: DeptTreeNode[] = [];
    for (const n of sorted) {
      out.push(n);
      if (n.expand === true && n.children?.length) {
        out.push(...this.visibleFlat(n.children));
      }
    }
    return out;
  }

  private rebuildVisible(): void {
    this.visibleList = this.visibleFlat(this.treeRoots);
  }

  private fillParentOptions(nodes: SysDept[], depth = 0): void {
    const sorted = [...nodes].sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    for (const n of sorted) {
      if (n.deptId == null) continue;
      const pad = '\u3000'.repeat(depth);
      this.parentOptions.push({ label: `${pad}${n.deptName ?? ''}`, value: n.deptId });
      if (n.children?.length) this.fillParentOptions(n.children, depth + 1);
    }
  }

  load(): void {
    this.loading = true;
    this.api.listDept(this.queryParams).subscribe({
      next: res => {
        const raw = (res.data ?? []) as SysDept[];
        this.treeRoots = this.normalizeRoots(raw);
        this.initTreeState(this.treeRoots, false);
        this.assignLevels(this.treeRoots, 0);
        this.allExpanded = false;
        this.rebuildVisible();
      },
      error: () => this.msg.error('加载失败'),
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetQuery(): void {
    this.queryParams = {};
    this.load();
  }

  onExpandChange(row: DeptTreeNode, expanded: boolean): void {
    row.expand = expanded;
    this.rebuildVisible();
    this.syncAllExpandedFlag();
    this.cdr.markForCheck();
  }

  private syncAllExpandedFlag(): void {
    let anyChild = false;
    let allOpen = true;
    const walk = (nodes: DeptTreeNode[]) => {
      for (const n of nodes) {
        if (n.children?.length) {
          anyChild = true;
          if (n.expand !== true) allOpen = false;
          walk(n.children);
        }
      }
    };
    walk(this.treeRoots);
    this.allExpanded = anyChild && allOpen;
  }

  toggleExpandAll(): void {
    this.allExpanded = !this.allExpanded;
    this.initTreeState(this.treeRoots, this.allExpanded);
    this.rebuildVisible();
    this.cdr.markForCheck();
  }

  private loadParentOptionsForAdd(): void {
    this.parentOptions = [];
    this.api.listDept().subscribe({
      next: res => {
        const roots = this.normalizeRoots((res.data ?? []) as SysDept[]);
        this.fillParentOptions(roots);
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载上级部门失败')
    });
  }

  private loadParentOptionsForEdit(deptId: number): void {
    this.parentOptions = [];
    this.api.listDeptExcludeChild(deptId).subscribe({
      next: res => {
        const roots = this.normalizeRoots((res.data ?? []) as SysDept[]);
        this.fillParentOptions(roots);
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载上级部门失败')
    });
  }

  openAdd(parent?: SysDept): void {
    this.form = {
      parentId: parent?.deptId ?? 0,
      deptName: '',
      orderNum: 0,
      leader: '',
      phone: '',
      email: '',
      status: '0'
    };
    this.modalTitle = '添加部门';
    this.modalOpen = true;
    this.loadParentOptionsForAdd();
  }

  openEdit(row: SysDept): void {
    const id = row.deptId;
    if (id == null) return;
    this.api.getDept(id).subscribe({
      next: res => {
        const d = res.data ?? {};
        this.form = {
          ...d,
          parentId: d.parentId ?? 0
        };
        this.modalTitle = '修改部门';
        this.modalOpen = true;
        this.loadParentOptionsForEdit(id);
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载部门失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = { parentId: 0, orderNum: 0, status: '0' };
  }

  submitModal(): void {
    const f = this.form;
    if (!f.deptName?.trim()) {
      this.msg.error('请填写部门名称');
      return;
    }
    this.modalLoading = true;
    const payload = { ...f, parentId: f.parentId ?? 0 } as SysDept;
    const req = f.deptId != null ? this.api.updateDept(payload) : this.api.addDept(payload);
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

  removeOne(row: SysDept): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除部门「${row.deptName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delDept(row.deptId!).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }
}
