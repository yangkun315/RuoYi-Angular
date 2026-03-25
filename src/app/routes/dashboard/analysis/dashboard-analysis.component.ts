import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabComponent, NzTabsComponent } from 'ng-zorro-antd/tabs';
import type { EChartsOption } from 'echarts';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard-analysis',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    NzGridModule,
    NzCardModule,
    NzTabsComponent,
    NzTabComponent,
    NzRadioModule,
    NzDatePickerModule,
    NzTableModule,
    NzIconModule,
    NzButtonModule,
    NzProgressModule,
    NgxEchartsDirective
  ],
  templateUrl: './dashboard-analysis.component.html',
  styleUrl: './dashboard-analysis.component.less'
})
export class DashboardAnalysisComponent {
  dateRange: [Date, Date] | null = null;
  rangePreset: 'today' | 'week' | 'month' | 'year' = 'today';
  channel: 'all' | 'online' | 'store' = 'all';

  readonly rankStores = Array.from({ length: 7 }).map((_, i) => ({
    rank: i + 1,
    name: `工专路 ${i} 号店`,
    sales: 323234 - i * 12000
  }));

  readonly hotTable = Array.from({ length: 5 }).map((_, i) => ({
    rank: i + 1,
    keyword: `搜索关键词-${i}`,
    users: 1200 - i * 80,
    weekChange: i % 2 === 0 ? 12.3 : -5.6,
    up: i % 2 === 0
  }));

  readonly stores = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    name: `门店${i}`,
    rate: 30 + (i * 7) % 51
  }));

  readonly selectedStore = signal(0);

  readonly salesBarOption: EChartsOption = {
    color: ['#69c0ff'],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '3%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: { type: 'value', max: 900 },
    series: [{ type: 'bar', barMaxWidth: 28, data: [310, 420, 360, 510, 590, 470, 560, 680, 620, 520, 600, 690] }]
  };

  /** 销售额类别占比（随 channel 仅切换标题演示，数据略变） */
  get pieOption(): EChartsOption {
    const mult = this.channel === 'online' ? 1.05 : this.channel === 'store' ? 0.95 : 1;
    const data = [
      { name: '家用电器', value: Math.round(2879 * mult) },
      { name: '食用酒水', value: Math.round(2104 * mult) },
      { name: '个护健康', value: Math.round(1973 * mult) },
      { name: '服饰箱包', value: Math.round(1483 * mult) },
      { name: '母婴产品', value: Math.round(780 * mult) },
      { name: '其他', value: Math.round(780 * mult) }
    ];
    return {
      color: ['#5b8ff9', '#5ad8a6', '#5d7092', '#f6bd16', '#6f5ef9', '#ff9845'],
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: '4%', top: 'middle' },
      series: [
        {
          name: '销售额',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['36%', '50%'],
          itemStyle: { borderRadius: 4 },
          label: { formatter: '{b} {d}%' },
          data
        }
      ]
    };
  }

  readonly storeLineOption = signal<EChartsOption>(this.buildStoreLine(0));

  selectStore(id: number): void {
    this.selectedStore.set(id);
    this.storeLineOption.set(this.buildStoreLine(id));
  }

  private buildStoreLine(seed: number): EChartsOption {
    const base = 40 + (seed % 5) * 3;
    return {
      color: ['#1890ff', '#52c41a'],
      tooltip: { trigger: 'axis' },
      legend: { data: ['客流量', '支付笔数'], top: 4 },
      grid: { left: '3%', right: '3%', bottom: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
      },
      yAxis: { type: 'value', min: 0, max: 100 },
      dataZoom: [{ type: 'slider', bottom: 6 }],
      series: [
        {
          name: '客流量',
          type: 'line',
          smooth: true,
          data: [base, base + 8, base - 4, base + 12, base + 5, base + 15, base + 3].map((v, i) => (v + i + seed) % 90)
        },
        {
          name: '支付笔数',
          type: 'line',
          smooth: true,
          data: [base - 6, base + 2, base - 10, base + 6, base - 2, base + 9, base + 1].map((v, i) => (v + i * 2 + seed) % 85)
        }
      ]
    };
  }
}
