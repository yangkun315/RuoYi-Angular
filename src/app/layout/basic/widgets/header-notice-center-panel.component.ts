import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

/** 通知：左侧类型图标 + 标题 + 时间 */
export interface NoticeNotifyItem {
  id: string;
  icon: string;
  color: string;
  title: string;
  time: string;
  /** 未读/强调行：浅蓝底 */
  highlight?: boolean;
  /** 标题用浅灰（如图1 第3 条） */
  mutedTitle?: boolean;
}

/** 消息：左侧头像图 + 标题 + 描述 + 时间 */
export interface NoticeMessageItem {
  id: string;
  avatarUrl: string;
  title: string;
  description: string;
  time: string;
}

export type NoticeTodoStatusVariant = 'default' | 'error' | 'warning' | 'processing';

/** 待办：标题 + 右侧状态标签 + 描述（无左侧图标） */
export interface NoticeTodoItem {
  id: string;
  title: string;
  status: string;
  statusVariant: NoticeTodoStatusVariant;
  description: string;
}

const defaultNotifyItems: NoticeNotifyItem[] = [
  { id: '1', icon: 'mail', color: '#f5222d', title: '你收到了 14 份新周报', time: '10 天' },
  {
    id: '2',
    icon: 'send',
    color: '#1890ff',
    title: '你推荐的 曲妮妮 已通过第三轮面试',
    time: '3 天',
    highlight: true
  },
  {
    id: '3',
    icon: 'plus',
    color: '#13c2c2',
    title: '这种模板可以区分多种通知类型',
    time: '3 个月',
    mutedTitle: true
  },
  { id: '4', icon: 'star', color: '#faad14', title: '左侧图标用于区分不同的类型', time: '大约 1 年' },
  {
    id: '5',
    icon: 'mail',
    color: '#f5222d',
    title: '内容不要超过两行字，超出时自动截断',
    time: '超过 8 年'
  }
];

const defaultMessageItems: NoticeMessageItem[] = [
  {
    id: 'm1',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=qulili',
    title: '曲丽丽 评论了你',
    description: '描述信息描述信息描述信息',
    time: '超过 8 年'
  },
  {
    id: 'm2',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=zhupianyou',
    title: '朱偏右 回复了你',
    description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
    time: '超过 8 年'
  },
  {
    id: 'm3',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=title3',
    title: '标题',
    description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
    time: '超过 8 年'
  }
];

const defaultTodoItems: NoticeTodoItem[] = [
  {
    id: 't1',
    title: '任务名称',
    status: '未开始',
    statusVariant: 'default',
    description: '任务需要在 2017-01-12 20:00 前启动'
  },
  {
    id: 't2',
    title: '第三方紧急代码变更',
    status: '马上到期',
    statusVariant: 'error',
    description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务'
  },
  {
    id: 't3',
    title: '信息安全考试',
    status: '已耗时 8 天',
    statusVariant: 'warning',
    description: '指派竹尔于 2017-01-09 前完成更新并发布'
  },
  {
    id: 't4',
    title: 'ABCD 版本发布',
    status: '进行中',
    statusVariant: 'processing',
    description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务'
  }
];

@Component({
  selector: 'header-notice-center-panel',
  standalone: true,
  imports: [
    NzAvatarModule,
    NzListModule,
    NzButtonModule,
    NzTabsModule,
    NzEmptyModule,
    NzTagModule
  ],
  templateUrl: './header-notice-center-panel.component.html',
  styleUrl: './header-notice-center-panel.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.header-notice-center-panel--embedded]': 'embedded()'
  }
})
export class HeaderNoticeCenterPanelComponent {
  readonly embedded = input(false);

  readonly notifyItems = signal<NoticeNotifyItem[]>([...defaultNotifyItems]);
  readonly messageItems = signal<NoticeMessageItem[]>([...defaultMessageItems]);
  readonly todoItems = signal<NoticeTodoItem[]>([...defaultTodoItems]);

  clearNotifications(): void {
    this.notifyItems.set([]);
  }

  clearMessages(): void {
    this.messageItems.set([]);
  }

  clearTodos(): void {
    this.todoItems.set([]);
  }
}
