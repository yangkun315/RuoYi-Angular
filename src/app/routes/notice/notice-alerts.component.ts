import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderNotificationsPanelComponent } from '../../layout/basic/widgets/header-notifications-panel.component';

@Component({
  selector: 'app-notice-alerts',
  standalone: true,
  imports: [HeaderNotificationsPanelComponent],
  template: `<div class="notice-fallback-page"><header-notifications-panel /></div>`,
  styles: [
    `
      .notice-fallback-page {
        min-height: 360px;
        padding: 24px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticeAlertsComponent {}
