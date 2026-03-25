import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { G2TagCloudModule } from '@delon/chart/tag-cloud';
import type { EChartsOption } from 'echarts';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-dashboard-monitor',
  standalone: true,
  imports: [NzGridModule, NzCardModule, NzStatisticModule, NzTagModule, NgxEchartsDirective, G2TagCloudModule],
  templateUrl: './dashboard-monitor.component.html',
  styleUrl: './dashboard-monitor.component.less'
})
export class DashboardMonitorComponent {
  readonly tagData = [
    { name: '本溪市', value: 48 },
    { name: '扬州市', value: 36 },
    { name: '温州市', value: 32 },
    { name: '烟台市', value: 28 },
    { name: '南昌市', value: 24 },
    { name: '深圳市', value: 40 },
    { name: '杭州市', value: 35 },
    { name: '南京市', value: 30 },
    { name: '北京市', value: 44 },
    { name: '上海市', value: 42 }
  ];

  readonly scatterMapOption: EChartsOption = {
    tooltip: {
      formatter: (p: unknown) => {
        const pt = p as { data?: [number, number, number] };
        const d = pt.data;
        return d ? `活跃度 ${d[2]}` : '';
      }
    },
    grid: { left: 0, right: 0, top: 16, bottom: 0 },
    xAxis: { show: false, min: 0, max: 100 },
    yAxis: { show: false, min: 0, max: 100 },
    series: [
      {
        type: 'scatter',
        symbolSize: (val: number[]) => Math.sqrt(val[2]) * 4,
        itemStyle: { color: 'rgba(24, 144, 255, 0.75)' },
        data: this.genBubbleData()
      }
    ]
  };

  readonly visitBarOption: EChartsOption = {
    color: ['#69c0ff', '#40a9ff', '#096dd9', '#0050b3'],
    tooltip: { trigger: 'axis' },
    grid: { left: '2%', right: '2%', bottom: '2%', top: '12%', containLabel: true },
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: {
      type: 'category',
      data: ['< 100 元', '101~500 元', '501~1000 元', '> 1000 元'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: 36, itemStyle: { color: '#5b8ff9' } },
          { value: 24, itemStyle: { color: '#5ad8a6' } },
          { value: 20, itemStyle: { color: '#f6bd16' } },
          { value: 20, itemStyle: { color: '#ff9845' } }
        ],
        label: { show: true, position: 'right', formatter: '{c}%' }
      }
    ]
  };

  readonly forecastAreaOption: EChartsOption = {
    color: ['#bae7ff'],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '3%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['00:00', '06:00', '12:00', '18:00', '23:00'] },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        areaStyle: {},
        data: [120, 200, 150, 280, 320]
      }
    ]
  };

  readonly gaugeOption: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 12,
            color: [
              [0.25, '#ff4d4f'],
              [0.5, '#faad14'],
              [0.75, '#1890ff'],
              [1, '#52c41a']
            ]
          }
        },
        pointer: { length: '55%', width: 6 },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: { valueAnimation: true, formatter: '跳出率 {value}%', fontSize: 14 },
        data: [{ value: 96 }]
      }
    ]
  };

  readonly categoryDonutOptions: EChartsOption[] = [
    this.singleDonut('中式快餐', 28, '#5b8ff9'),
    this.singleDonut('西餐', 22, '#5ad8a6'),
    this.singleDonut('火锅', 32, '#f6bd16')
  ];

  readonly subsidyPieOption: EChartsOption = {
    color: ['#1890ff', '#f0f0f0'],
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['50%', '72%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: '补贴资金剩余\n34%',
          fontSize: 13,
          lineHeight: 18
        },
        data: [
          { value: 34, name: '剩余', itemStyle: { color: '#1890ff' } },
          { value: 66, name: '已用', itemStyle: { color: '#f5f5f5' } }
        ]
      }
    ]
  };

  private genBubbleData(): [number, number, number][] {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 40; i++) {
      out.push([10 + Math.random() * 80, 15 + Math.random() * 70, 30 + Math.random() * 120]);
    }
    return out;
  }

  private singleDonut(title: string, pct: number, color: string): EChartsOption {
    return {
      title: {
        text: title,
        left: 'center',
        bottom: 0,
        textStyle: { fontSize: 12 }
      },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['52%', '75%'],
          center: ['50%', '45%'],
          label: { show: true, position: 'center', formatter: `${pct}%`, fontSize: 16, fontWeight: 600 },
          data: [
            { value: pct, itemStyle: { color } },
            { value: 100 - pct, itemStyle: { color: '#f0f0f0' } }
          ]
        }
      ]
    };
  }
}
