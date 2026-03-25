import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';

import { echarts } from '../../core/echarts';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
})
export class DashboardShellComponent {}
