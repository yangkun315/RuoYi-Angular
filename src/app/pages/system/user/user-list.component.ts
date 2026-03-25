import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserApi } from '../../../api/system/user.api';
import { ConfigApi } from '../../../api/system/config.api';
import type { SysUser, UserQueryParams } from '../../../core/types/api/system/user';
import type { SysPost } from '../../../core/types/api/system/post';
import type { SysRole } from '../../../core/types/api/system/role';
import type { TreeSelect } from '../../../core/types/api/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzUploadModule, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import type { NzFormatEmitEvent } from 'ng-zorro-antd/core/tree';
import type { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTreeModule,
    NzTreeSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSwitchModule,
    NzModalModule,
    NzUploadModule,
    NzDropDownModule,
    NzDividerModule,
    NzGridModule,
    NzTooltipModule,
    NzIconModule
  ]
})
export class UserListComponent implements OnInit {
  readonly cdr = inject(ChangeDetectorRef);
  private readonly userApi = inject(UserApi);
  private readonly configApi = inject(ConfigApi);
  private readonly http = inject(HttpClient);
  private readonly msg = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  list: SysUser[] = [];
  loading = false;
  total = 0;
  showSearch = true;
  deptFilterText = '';
  deptNzNodes: NzTreeNodeOptions[] = [];
  deptSelectNodes: NzTreeNodeOptions[] = [];
  deptExpandedKeys: string[] = [];
  selectedDeptKeys: string[] = [];
  dateRange: [Date, Date] | null = null;

  queryParams: UserQueryParams = {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  };

  readonly statusDict = [
    { label: '正常', value: '0' as const },
    { label: '停用', value: '1' as const }
  ];
  readonly sexDict = [
    { label: '男', value: '0' as const },
    { label: '女', value: '1' as const },
    { label: '未知', value: '2' as const }
  ];

  columnDefs = [
    { key: 'userId' as const, label: '用户编号' },
    { key: 'userName' as const, label: '用户名称' },
    { key: 'nickName' as const, label: '用户昵称' },
    { key: 'deptName' as const, label: '部门' },
    { key: 'phonenumber' as const, label: '手机号码' },
    { key: 'status' as const, label: '状态' },
    { key: 'createTime' as const, label: '创建时间' }
  ];
  columns: Record<string, boolean> = {
    userId: true,
    userName: true,
    nickName: true,
    deptName: true,
    phonenumber: true,
    status: true,
    createTime: true
  };

  setOfCheckedId = new Set<number>();
  checkedAll = false;
  indeterminate = false;

  moreRow: SysUser | null = null;

  modalOpen = false;
  modalTitle = '';
  modalSubmitting = false;
  form: SysUser = this.emptyForm();
  postOptions: SysPost[] = [];
  roleOptions: SysRole[] = [];
  initPassword = '';

  resetPwdOpen = false;
  resetPwdUser: SysUser | null = null;
  resetPwdValue = '';

  importOpen = false;
  importUpdateSupport = false;

  get singleDisabled(): boolean {
    return this.setOfCheckedId.size !== 1;
  }

  get multipleDisabled(): boolean {
    return this.setOfCheckedId.size === 0;
  }

  ngOnInit(): void {
    this.userApi.deptTreeSelect().subscribe({
      next: res => {
        const data = (res as { data?: TreeSelect[] }).data ?? [];
        this.deptNzNodes = this.toTreeNodes(data, false);
        this.deptSelectNodes = this.toTreeNodes(data, true);
        this.deptExpandedKeys = this.collectKeys(this.deptNzNodes);
        this.cdr.markForCheck();
      }
    });
    this.configApi.getConfigKey('sys.user.initPassword').subscribe({
      next: res => {
        if (res?.msg) this.initPassword = res.msg;
      }
    });
    this.load();
  }

  private emptyForm(): SysUser {
    return {
      userId: undefined,
      deptId: undefined,
      userName: undefined,
      nickName: undefined,
      password: undefined,
      phonenumber: undefined,
      email: undefined,
      sex: undefined,
      status: '0',
      remark: undefined,
      postIds: [],
      roleIds: []
    };
  }

  private toTreeNodes(nodes: TreeSelect[], forSelect: boolean): NzTreeNodeOptions[] {
    return (nodes ?? []).map(n => {
      const key = String(n.id ?? '');
      const base: NzTreeNodeOptions = {
        title: n.label ?? '',
        key,
        disabled: !!n.disabled,
        children: (n.children?.length ? this.toTreeNodes(n.children, forSelect) : undefined) as NzTreeNodeOptions[] | undefined,
        isLeaf: !(n.children && n.children.length > 0)
      };
      if (forSelect) {
        (base as NzTreeNodeOptions & { value?: number }).value = n.id;
      }
      return base;
    });
  }

  private collectKeys(nodes: NzTreeNodeOptions[]): string[] {
    const keys: string[] = [];
    const walk = (ns: NzTreeNodeOptions[]) => {
      for (const n of ns) {
        keys.push(n.key as string);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(nodes);
    return keys;
  }

  onDeptTreeClick(ev: NzFormatEmitEvent): void {
    const key = ev.node?.key;
    if (key == null) return;
    this.selectedDeptKeys = [key as string];
    const id = Number(key);
    this.queryParams.deptId = Number.isFinite(id) ? id : undefined;
    this.handleQuery();
  }

  buildListQuery(): UserQueryParams {
    const q: UserQueryParams = {
      pageNum: this.queryParams.pageNum,
      pageSize: this.queryParams.pageSize,
      userName: this.queryParams.userName || undefined,
      phonenumber: this.queryParams.phonenumber || undefined,
      status: this.queryParams.status,
      deptId: this.queryParams.deptId,
      params: {}
    };
    if (this.dateRange?.[0] && this.dateRange[1]) {
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      q.params = { beginTime: fmt(this.dateRange[0]), endTime: fmt(this.dateRange[1]) };
    }
    return q;
  }

  load(): void {
    this.loading = true;
    this.userApi.listUser(this.buildListQuery()).subscribe({
      next: res => {
        this.list = (res.rows ?? []) as SysUser[];
        this.total = res.total ?? 0;
        this.refreshCheckStatus();
      },
      error: () => this.msg.error('加载用户列表失败'),
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onTableQueryParams(params: NzTableQueryParams): void {
    this.queryParams.pageNum = params.pageIndex;
    this.queryParams.pageSize = params.pageSize;
    this.load();
  }

  handleQuery(): void {
    this.queryParams.pageNum = 1;
    this.load();
  }

  resetQuery(): void {
    this.dateRange = null;
    this.queryParams = {
      pageNum: 1,
      pageSize: this.queryParams.pageSize ?? 10,
      userName: undefined,
      phonenumber: undefined,
      status: undefined,
      deptId: undefined
    };
    this.selectedDeptKeys = [];
    this.load();
  }

  refreshCheckStatus(): void {
    const pageUsers = this.list.filter(u => u.userId !== 1);
    const checkedOnPage = pageUsers.filter(u => this.setOfCheckedId.has(u.userId!));
    this.checkedAll = pageUsers.length > 0 && checkedOnPage.length === pageUsers.length;
    this.indeterminate = checkedOnPage.length > 0 && checkedOnPage.length < pageUsers.length;
  }

  onAllChecked(checked: boolean): void {
    this.list.forEach(row => {
      if (row.userId === 1) return;
      if (checked) this.setOfCheckedId.add(row.userId!);
      else this.setOfCheckedId.delete(row.userId!);
    });
    this.refreshCheckStatus();
    this.cdr.markForCheck();
  }

  onItemChecked(userId: number, checked: boolean): void {
    if (checked) this.setOfCheckedId.add(userId);
    else this.setOfCheckedId.delete(userId);
    this.refreshCheckStatus();
    this.cdr.markForCheck();
  }

  onStatusChange(row: SysUser, checked: boolean): void {
    const next = checked ? '0' : '1';
    const prev = row.status;
    const text = next === '0' ? '启用' : '停用';
    this.modal.confirm({
      nzTitle: '确认操作',
      nzContent: `确认要「${text}」用户「${row.userName}」吗？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.userApi.changeUserStatus(row.userId!, next).subscribe({
            next: () => {
              row.status = next;
              this.msg.success(`${text}成功`);
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

  handleDelete(row?: SysUser): void {
    const ids: number | number[] = row?.userId != null ? row.userId : [...this.setOfCheckedId];
    if (Array.isArray(ids) ? ids.length === 0 : false) {
      this.msg.warning('请选择要删除的用户');
      return;
    }
    const idLabel = Array.isArray(ids) ? ids.join(',') : String(ids);
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除用户编号为「${idLabel}」的数据项？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.userApi.delUser(ids).subscribe({
            next: () => {
              this.msg.success('删除成功');
              this.setOfCheckedId.clear();
              this.load();
              resolve();
            },
            error: () => reject()
          });
        })
    });
  }

  handleBatchDelete(): void {
    this.handleDelete();
  }

  handleExport(): void {
    const body = this.toUrlEncoded(this.buildListQuery() as unknown as Record<string, unknown>);
    this.http
      .post('/system/user/export', body, {
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
          let name = `user_${Date.now()}.xlsx`;
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

  private toUrlEncoded(obj: Record<string, unknown>): string {
    const p = new URLSearchParams();
    const walk = (prefix: string, val: unknown) => {
      if (val === null || val === undefined || val === '') return;
      if (typeof val === 'object' && !Array.isArray(val)) {
        Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
          const key = prefix ? `${prefix}[${k}]` : k;
          walk(key, v);
        });
      } else {
        p.append(prefix, String(val));
      }
    };
    Object.entries(obj).forEach(([k, v]) => walk(k, v));
    return p.toString();
  }

  openImport(): void {
    this.importOpen = true;
  }

  downloadImportTemplate(): void {
    this.http
      .post('/system/user/importTemplate', '', {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }),
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: resp => {
          const blob = resp.body;
          if (!blob) return;
          let name = `user_template_${Date.now()}.xlsx`;
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
        },
        error: () => this.msg.error('下载模板失败')
      });
  }

  customImportRequest = (item: NzUploadXHRArgs): Subscription => {
    const fd = new FormData();
    fd.append('file', item.postFile as Blob);
    const url = `/system/user/importData?updateSupport=${this.importUpdateSupport ? 1 : 0}`;
    return this.http.post(url, fd).subscribe({
      next: (res: unknown) => {
        const r = res as { code?: number; msg?: string };
        item.onSuccess!(res, item.file, null);
        if (r?.code === 200) {
          this.msg.success(r.msg || '导入成功');
          this.importOpen = false;
          this.load();
        } else {
          this.msg.warning(r?.msg || '导入完成，请查看提示');
          this.load();
        }
      },
      error: err => {
        item.onError!(err, item.file);
        this.msg.error('导入失败');
      }
    });
  };

  handleAdd(): void {
    this.userApi.getUser().subscribe({
      next: res => {
        this.postOptions = res.posts ?? [];
        this.roleOptions = res.roles ?? [];
        this.form = this.emptyForm();
        this.form.password = this.initPassword || undefined;
        this.modalTitle = '添加用户';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载表单数据失败')
    });
  }

  handleUpdate(row?: SysUser): void {
    const userId = row?.userId ?? [...this.setOfCheckedId][0];
    if (userId == null) {
      this.msg.warning('请选择一条记录');
      return;
    }
    this.userApi.getUser(userId).subscribe({
      next: res => {
        const d = res.data ?? {};
        this.form = {
          ...d,
          postIds: res.postIds ?? [],
          roleIds: res.roleIds ?? []
        };
        this.postOptions = res.posts ?? [];
        this.roleOptions = res.roles ?? [];
        this.modalTitle = '修改用户';
        this.modalOpen = true;
        this.cdr.markForCheck();
      },
      error: () => this.msg.error('加载用户失败')
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.form = this.emptyForm();
  }

  submitForm(): void {
    const f = this.form;
    if (!f.nickName?.trim()) {
      this.msg.error('用户昵称不能为空');
      return;
    }
    if (f.deptId == null) {
      this.msg.error('请选择归属部门');
      return;
    }
    if (f.userId == null) {
      if (!f.userName?.trim()) {
        this.msg.error('用户名称不能为空');
        return;
      }
      if (!f.password?.trim()) {
        this.msg.error('用户密码不能为空');
        return;
      }
    }
    this.modalSubmitting = true;
    const req =
      f.userId != null
        ? this.userApi.updateUser(f)
        : this.userApi.addUser(f);
    req.subscribe({
      next: () => {
        this.msg.success(f.userId != null ? '修改成功' : '新增成功');
        this.modalOpen = false;
        this.form = this.emptyForm();
        this.load();
      },
      error: () => {},
      complete: () => {
        this.modalSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  openResetPwd(row: SysUser): void {
    this.resetPwdUser = row;
    this.resetPwdValue = '';
    this.resetPwdOpen = true;
  }

  submitResetPwd(): void {
    const v = this.resetPwdValue?.trim();
    if (!v || v.length < 5 || v.length > 20) {
      this.msg.error('密码长度须为 5～20 位');
      return;
    }
    if (/[<>"'|\\]/.test(v)) {
      this.msg.error('不能包含非法字符：< > " \' \\ |');
      return;
    }
    const u = this.resetPwdUser;
    if (!u?.userId) return;
    this.userApi.resetUserPwd(u.userId, v).subscribe({
      next: () => {
        this.msg.success('修改成功');
        this.resetPwdOpen = false;
      },
      error: () => {}
    });
  }

  handleAuthRole(row: SysUser): void {
    this.msg.info('分配角色：请在路由中配置「用户授权角色」页面后对接 /system/user/authRole/' + row.userId);
  }
}
