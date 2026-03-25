/**
 * 地图相关 ECharts 模块：与 echarts.ts 共用同一 runtime，仅在需要地图的页面中 `await import('./echarts-maps')`
 */
import { MapChart } from 'echarts/charts';
import { GeoComponent, VisualMapComponent } from 'echarts/components';
import * as echarts from 'echarts/core';

echarts.use([MapChart, GeoComponent, VisualMapComponent]);
