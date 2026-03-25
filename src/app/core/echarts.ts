import * as echarts from 'echarts/core';
import { BarChart, GaugeChart, LineChart, MapChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  ScatterChart,
  GaugeChart,
  GeoComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer
]);

export { echarts };
