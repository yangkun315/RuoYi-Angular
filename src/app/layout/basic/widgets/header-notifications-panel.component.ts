import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';

export interface SocialNoticeItem {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
}

@Component({
  selector: 'header-notifications-panel',
  standalone: true,
  imports: [NzListModule, NzAvatarModule, NzDividerModule, NzButtonModule],
  templateUrl: './header-notifications-panel.component.html',
  styleUrl: './header-notifications-panel.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.header-notifications-panel--embedded]': 'embedded()'
  }
})
export class HeaderNotificationsPanelComponent {
  readonly embedded = input(false);

  readonly items: SocialNoticeItem[] = [
    {
      id: '1',
      name: 'cipchk',
      description: "Please tell me what happened in a few words, don't go into details.",
      avatarUrl: 'https://api.dicebear.com/7.x/big-ears/svg?seed=cipchk'
    },
    {
      id: '2',
      name: 'はなさき',
      description: 'ハルカソラトキヘダツヒカリ',
      avatarUrl: 'https://api.dicebear.com/7.x/big-ears/svg?seed=hanasaki'
    },
    {
      id: '3',
      name: '苏先生',
      description: '请告诉我，我应该说点什么好？',
      avatarUrl: 'https://api.dicebear.com/7.x/big-ears/svg?seed=su'
    },
    {
      id: '4',
      name: 'Kent',
      description: "Please tell me what happened in a few words, don't go into details.",
      avatarUrl: 'https://api.dicebear.com/7.x/big-ears/svg?seed=kent'
    },
    {
      id: '5',
      name: 'Jefferson',
      description: "Please tell me what happened in a few words, don't go into details.",
      avatarUrl: 'https://api.dicebear.com/7.x/big-ears/svg?seed=jefferson'
    }
  ];
}
