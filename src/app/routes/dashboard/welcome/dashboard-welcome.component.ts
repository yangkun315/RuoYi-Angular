import { HttpClient, HttpContext } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { IGNORE_BASE_URL } from '@delon/theme';
import { registerMap } from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { forkJoin } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgxEchartsDirective } from 'ngx-echarts';

type KpiTone = 'blue' | 'green' | 'orange' | 'magenta';

@Component({
  selector: 'app-dashboard-welcome',
  standalone: true,
  imports: [
    NzGridModule,
    NzCardModule,
    NgxEchartsDirective
  ],
  templateUrl: './dashboard-welcome.component.html',
  styleUrl: './dashboard-welcome.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWelcomeComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly statCards: { title: string; value: string; tone: KpiTone; spark: number[] }[] = [
    { title: '网站流量', value: '123,456', tone: 'blue', spark: [42, 68, 55, 72, 61, 78, 52, 85, 48, 70, 63, 75] },
    { title: '展示量', value: '234,567K', tone: 'green', spark: [55, 48, 62, 58, 70, 65, 52, 80, 72, 60, 68, 77] },
    { title: '销售总额', value: '¥458,778', tone: 'orange', spark: [38, 52, 45, 58, 50, 68, 62, 55, 72, 48, 60, 66] },
    { title: '待处理工单', value: '456', tone: 'magenta', spark: [48, 55, 42, 60, 52, 58, 45, 68, 50, 62, 56, 48] }
  ];

  readonly barOption: EChartsOption = {
    color: ['#69c0ff'],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: { type: 'value', max: 900 },
    series: [{ type: 'bar', barMaxWidth: 28, data: [320, 450, 380, 520, 610, 480, 590, 720, 680, 540, 620, 700] }]
  };

  readonly lineOption: EChartsOption = {
    color: ['#1890ff', '#52c41a'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['客流量', '支付笔数'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00']
    },
    yAxis: { type: 'value', min: 0, max: 100 },
    dataZoom: [{ type: 'slider', start: 10, end: 90, bottom: 8 }],
    series: [
      { name: '客流量', type: 'line', smooth: true, data: [45, 38, 62, 55, 48, 72, 58, 41] },
      { name: '支付笔数', type: 'line', smooth: true, data: [32, 28, 44, 51, 39, 55, 49, 36] }
    ]
  };

  /** 业务分项占比（饼图） */
  readonly pieOption: EChartsOption = {
    color: ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1'],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '4%', top: 'middle' },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4 },
        label: { formatter: '{b}\n{d}%' },
        data: [
          { value: 335, name: '技术服务' },
          { value: 234, name: '产品销售' },
          { value: 188, name: '运维服务' },
          { value: 142, name: '咨询' },
          { value: 101, name: '其它' }
        ]
      }
    ]
  };

  /** 多指标趋势折线（与上一张折线图区分） */
  readonly trendLineOption: EChartsOption = {
    color: ['#1890ff', '#fa8c16', '#722ed1'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单量', '转化率', '客单价指数'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value', min: 0, max: 120 },
    series: [
      { name: '订单量', type: 'line', smooth: true, data: [82, 91, 78, 95, 88, 72, 85] },
      { name: '转化率', type: 'line', smooth: true, data: [58, 62, 55, 68, 64, 52, 60] },
      { name: '客单价指数', type: 'line', smooth: true, data: [70, 73, 69, 76, 74, 67, 71] }
    ]
  };

  readonly mapsReady = signal(false);
  readonly chinaMapOption = signal<EChartsOption | null>(null);
  readonly worldMapOption = signal<EChartsOption | null>(null);

  ngOnInit(): void {
    const ctx = new HttpContext().set(IGNORE_BASE_URL, true);
    forkJoin({
      china: this.http.get<GeoJsonInput>('/assets/geo/china.json', { context: ctx }),
      world: this.http.get<GeoJsonInput>('/assets/geo/world.json', { context: ctx })
    }).subscribe(({ china, world }) => {
      registerMap('china', china as never);
      registerMap('world', world as never);
      this.chinaMapOption.set(this.buildChinaMapOption());
      this.worldMapOption.set(this.buildWorldMapOption());
      this.mapsReady.set(true);
    });
  }

  private buildChinaMapOption(): EChartsOption {
    return {
      tooltip: { trigger: 'item', formatter: '{b}<br/>模拟访问量 {c}' },
      visualMap: {
        min: 0,
        max: 450,
        left: 16,
        bottom: 24,
        text: ['高', '低'],
        calculable: true,
        inRange: { color: ['#e6f7ff', '#1890ff', '#0050b3'] }
      },
      series: [
        {
          name: '访问量',
          type: 'map',
          map: 'china',
          roam: true,
          emphasis: { label: { show: true }, itemStyle: { areaColor: '#ffd666' } },
          label: { show: true, fontSize: 9, color: '#444' },
          data: [
            { name: '北京', value: 420 },
            { name: '上海', value: 410 },
            { name: '广东', value: 380 },
            { name: '浙江', value: 340 },
            { name: '江苏', value: 360 },
            { name: '四川', value: 260 },
            { name: '湖北', value: 240 },
            { name: '山东', value: 320 },
            { name: '河南', value: 290 },
            { name: '福建', value: 220 },
            { name: '湖南', value: 210 }
          ]
        }
      ]
    };
  }

  private buildWorldMapOption(): EChartsOption {
    return {
      tooltip: { trigger: 'item', formatter: '{b}<br/>模拟指数 {c}' },
      visualMap: {
        min: 0,
        max: 520,
        left: 16,
        bottom: 24,
        text: ['高', '低'],
        calculable: true,
        inRange: { color: ['#f0f5ff', '#597ef7', '#10239e'] }
      },
      series: [
        {
          name: '业务指数',
          type: 'map',
          map: 'world',
          roam: true,
          emphasis: { label: { show: true }, itemStyle: { areaColor: '#ffc069' } },
          label: { show: false },
          data: [
            { name: 'China', value: 500 },
            { name: 'United States', value: 420 },
            { name: 'Russia', value: 280 },
            { name: 'Brazil', value: 220 },
            { name: 'India', value: 300 },
            { name: 'Canada', value: 190 },
            { name: 'Australia', value: 170 },
            { name: 'Germany', value: 310 },
            { name: 'France', value: 260 },
            { name: 'Japan', value: 340 }
          ]
        }
      ]
    };
  }
}

/** registerMap 接受的 GeoJSON（简化类型） */
interface GeoJsonInput {
  type?: string;
  features?: unknown[];
}
