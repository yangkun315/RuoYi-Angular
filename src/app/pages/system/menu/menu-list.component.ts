import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuApi } from '../../../api/system/menu.api';
import type { MenuQueryParams, SysMenu } from '../../../core/types/api/system/menu';
import type { TreeSelect } from '../../../core/types/api/common';
import { menuIconToNzType } from '../../../core/utils/menu-icon.util';
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
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

export type MenuTreeNode = SysMenu & {
  expand?: boolean;
  level?: number;
  children?: MenuTreeNode[];
};

@Component({
  selector: 'app-menu-list',
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
    NzTooltipModule,
    NzTagModule
  ],
  templateUrl: './menu-list.component.html',
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
export class MenuListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(MenuApi);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  readonly indentUnit = 20;

  treeRoots: MenuTreeNode[] = [];
  visibleList: MenuTreeNode[] = [];
  loading = false;
  showSearch = true;
  allExpanded = false;
  queryParams: MenuQueryParams = {};

  statusDict = [
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ];

  menuTypeDict = [
    { label: '目录', value: 'M' },
    { label: '菜单', value: 'C' },
    { label: '按钮', value: 'F' }
  ];

  modalOpen = false;
  modalTitle = '';
  modalLoading = false;
  form: Partial<SysMenu> = {};
  parentOptions: { label: string; value: number }[] = [];

  ngOnInit(): void {
    this.load();
  }

  componentPath(row: SysMenu): string {
    const c = row.component?.trim();
    const p = row.path?.trim();
    if (c && p) return `${c} / ${p}`;
    return c || p || '';
  }

  /** 后端菜单图标名 → ng-zorro 已注册 nzType，避免 IconNotFoundError */
  rowIconNzType(icon: string | undefined | null): string {
    return menuIconToNzType(icon);
  }

  private normalizeRoots(raw: SysMenu[]): MenuTreeNode[] {
    if (!raw?.length) return [];
    const nested = raw.some(d => d.children && d.children.length);
    if (nested) return raw as MenuTreeNode[];
    return buildTreeFromFlat(raw as unknown as Record<string, unknown>[], {
      idKey: 'menuId',
      parentKey: 'parentId',
      childrenKey: 'children'
    }) as MenuTreeNode[];
  }

  private initTreeState(nodes: MenuTreeNode[], expand: boolean): void {
    for (const n of nodes) {
      if (n.children?.length) {
        n.expand = expand;
        this.initTreeState(n.children, expand);
      } else {
        n.expand = false;
      }
    }
  }

  private assignLevels(nodes: MenuTreeNode[], level = 0): void {
    for (const n of nodes) {
      n.level = level;
      if (n.children?.length) this.assignLevels(n.children, level + 1);
    }
  }

  private visibleFlat(nodes: MenuTreeNode[]): MenuTreeNode[] {
    const sorted = [...nodes].sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
    const out: MenuTreeNode[] = [];
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

  private flattenTreeSelect(nodes: TreeSelect[], depth = 0): void {
    for (const n of nodes) {
      if (n.id != null) {
        this.parentOptions.push({ label: '\u3000'.repeat(depth) + (n.label ?? ''), value: n.id });
      }
      if (n.children?.length) this.flattenTreeSelect(n.children, depth + 1);
    }
  }

  private loadParentTree(): void {
    this.parentOptions = [];
    this.api.treeselect().subscribe({
      next: res => {
        this.flattenTreeSelect(res.data ?? []);
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载菜单树失败')
    });
  }

  load(): void {
    this.loading = true;
    this.api.listMenu(this.queryParams).subscribe({
      next: res => {
        const raw = (res.data ?? []) as SysMenu[];
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

  onExpandChange(row: MenuTreeNode, expanded: boolean): void {
    row.expand = expanded;
    this.rebuildVisible();
    this.syncAllExpandedFlag();
    this.cdr.markForCheck();
  }

  /** 是否所有「有子节点」的节点当前都处于展开 */
  private syncAllExpandedFlag(): void {
    let anyChild = false;
    let allOpen = true;
    const walk = (nodes: MenuTreeNode[]) => {
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

  emptyForm(parentId?: number): Partial<SysMenu> {
    return {
      parentId: parentId ?? 0,
      menuType: 'M',
      menuName: '',
      orderNum: 0,
      path: '',
      component: '',
      query: '',
      isFrame: '1',
      isCache: '0',
      visible: '0',
      status: '0',
      perms: '',
      icon: ''
    };
  }

  openAdd(parent?: SysMenu): void {
    this.form = this.emptyForm(parent?.menuId);
    this.modalTitle = '添加菜单';
    this.modalOpen = true;
    this.loadParentTree();
  }

  openEdit(row: SysMenu): void {
    const id = row.menuId;
    if (id == null) return;
    this.api.getMenu(id).subscribe({
      next: res => {
        const d = res.data ?? {};
        this.form = {
          ...d,
          parentId: d.parentId ?? 0
        };
        this.modalTitle = '修改菜单';
        this.modalOpen = true;
        this.loadParentTree();
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载菜单失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = {};
  }

  submitModal(): void {
    const f = this.form;
    if (!f.menuName?.trim()) {
      this.msg.error('请填写菜单名称');
      return;
    }
    if (f.menuType === 'C' && !f.path?.trim()) {
      this.msg.error('菜单类型为「菜单」时请填写路由地址');
      return;
    }
    if (f.menuType === 'F' && !f.perms?.trim()) {
      this.msg.error('按钮类型请填写权限标识');
      return;
    }
    this.modalLoading = true;
    const payload = { ...f, parentId: f.parentId ?? 0 } as SysMenu;
    const req = f.menuId != null ? this.api.updateMenu(payload) : this.api.addMenu(payload);
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

  removeOne(row: SysMenu): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除菜单「${row.menuName}」？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.delMenu(row.menuId!).subscribe({
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
