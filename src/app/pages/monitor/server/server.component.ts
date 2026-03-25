import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ServerApi } from '../../../api/monitor/server.api';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';

type LooseObj = Record<string, unknown>;

export interface LabelValue {
  label: string;
  value: string;
}

export interface MemCompareRow {
  label: string;
  mem: string;
  jvm: string;
}

export interface SysDescRow {
  label: string;
  value: string;
  span?: number;
}

export interface JvmDescRow {
  label: string;
  value: string;
  fullWidth?: boolean;
}

@Component({
  selector: 'app-server',
  standalone: true,
  imports: [
    CommonModule,
    NzAlertModule,
    NzCardModule,
    NzDescriptionsModule,
    NzGridModule,
    NzSpinModule,
    NzTableModule
  ],
  templateUrl: './server.component.html',
  styleUrl: './server.component.less'
})
export class ServerComponent implements OnInit {
  private readonly api = inject(ServerApi);
  private readonly msg = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMsg = '';
  raw: LooseObj = {};

  cpuRows: LabelValue[] = [];
  memRows: MemCompareRow[] = [];
  sysRows: SysDescRow[] = [];
  jvmRows: JvmDescRow[] = [];
  diskRows: Array<Record<string, string | number | undefined>> = [];

  ngOnInit(): void {
    this.refresh();
  }

  isRecord(v: unknown): v is LooseObj {
    return v != null && typeof v === 'object' && !Array.isArray(v);
  }

  refresh(): void {
    this.loading = true;
    this.errorMsg = '';
    this.api.getServer().subscribe({
      next: res => {
        const data = (res as { data?: unknown }).data;
        this.raw = this.isRecord(data) ? data : {};
        this.rebuildDisplay();
        const files = this.raw['sysFiles'];
        this.diskRows = Array.isArray(files) ? (files as Array<Record<string, string | number | undefined>>) : [];
      },
      error: () => {
        this.errorMsg = '加载失败，请确认后端已启动';
        this.msg.error('服务监控加载失败');
        this.cpuRows = [];
        this.memRows = [];
        this.sysRows = [];
        this.jvmRows = [];
        this.diskRows = [];
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private rebuildDisplay(): void {
    const cpu = this.block('cpu');
    const mem = this.block('mem');
    const jvm = this.block('jvm');
    const sys = this.block('sys');

    this.cpuRows = this.buildCpuRows(cpu);
    this.memRows = this.buildMemRows(mem, jvm);
    this.sysRows = this.buildSysRows(sys);
    this.jvmRows = this.buildJvmRows(jvm);
  }

  private block(key: string): LooseObj {
    const v = this.raw[key];
    return this.isRecord(v) ? v : {};
  }

  /** 若依 CPU：核心数、用户使用率、系统使用率、当前空闲率 */
  private buildCpuRows(cpu: LooseObj): LabelValue[] {
    const defs: { key: string; label: string; pct?: boolean }[] = [
      { key: 'cpuNum', label: '核心数' },
      { key: 'used', label: '用户使用率', pct: true },
      { key: 'sys', label: '系统使用率', pct: true },
      { key: 'free', label: '当前空闲率', pct: true }
    ];
    return defs.map(d => ({
      label: d.label,
      value: this.fmtMetric(cpu[d.key], d.pct)
    }));
  }

  /** 若依内存卡片：属性 | 内存 | JVM */
  private buildMemRows(mem: LooseObj, jvm: LooseObj): MemCompareRow[] {
    return [
      { label: '总内存', mem: this.str(mem['total']), jvm: this.str(jvm['total']) },
      { label: '已用内存', mem: this.str(mem['used']), jvm: this.str(jvm['used']) },
      { label: '剩余内存', mem: this.str(mem['free']), jvm: this.str(jvm['free']) },
      {
        label: '使用率',
        mem: this.fmtUsage(mem['usage']),
        jvm: this.fmtUsage(jvm['usage'])
      }
    ];
  }

  /** 服务器信息 */
  private buildSysRows(sys: LooseObj): SysDescRow[] {
    const ip = sys['computerIp'] ?? sys['ip'];
    const defs: { value: unknown; label: string; span?: number }[] = [
      { value: sys['computerName'], label: '服务器名称' },
      { value: sys['osName'], label: '操作系统' },
      { value: ip, label: '服务器IP' },
      { value: sys['osArch'], label: '系统架构' },
      { value: sys['userDir'], label: '项目路径', span: 2 }
    ];
    return defs.map(d => ({
      label: d.label,
      value: this.str(d.value) || '—',
      span: d.span
    }));
  }

  /** Java 虚拟机信息（运行参数占满一行） */
  private buildJvmRows(jvm: LooseObj): JvmDescRow[] {
    const normal: { key: string; label: string }[] = [
      { key: 'name', label: 'Java名称' },
      { key: 'version', label: 'Java版本' },
      { key: 'startTime', label: '启动时间' },
      { key: 'runTime', label: '运行时长' },
      { key: 'home', label: '安装路径' },
      { key: 'userDir', label: '项目路径' }
    ];
    const rows: JvmDescRow[] = normal.map(d => ({
      label: d.label,
      value: this.str(jvm[d.key]) || '—'
    }));
    const args = jvm['inputArgs'];
    rows.push({
      label: '运行参数',
      value: args != null && args !== '' ? String(args) : '—',
      fullWidth: true
    });
    return rows;
  }

  private str(v: unknown): string {
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  private fmtMetric(v: unknown, asPct?: boolean): string {
    if (v == null || v === '') return '—';
    if (asPct) {
      const s = String(v);
      if (s.includes('%')) return s;
      const n = Number(v);
      if (!Number.isNaN(n)) return `${n}%`;
    }
    return String(v);
  }

  private fmtUsage(v: unknown): string {
    if (v == null || v === '') return '—';
    const s = String(v);
    if (s.includes('%')) return s;
    const n = Number(v);
    if (!Number.isNaN(n)) return `${n}%`;
    return s;
  }
}
