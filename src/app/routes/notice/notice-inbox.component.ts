import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderNoticeCenterPanelComponent } from '../../layout/basic/widgets/header-notice-center-panel.component';

@Component({
  selector: 'app-notice-inbox',
  standalone: true,
  imports: [HeaderNoticeCenterPanelComponent],
  template: `<div class="notice-fallback-page"><header-notice-center-panel /></div>`,
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
export class NoticeInboxComponent {}
