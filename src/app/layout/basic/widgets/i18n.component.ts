import { ChangeDetectionStrategy, Component, Input, booleanAttribute, inject, DOCUMENT } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'header-i18n',
  template: `
    <span
      nz-dropdown
      [nzDropdownMenu]="langMenu"
      nzPlacement="bottomRight"
      nzTrigger="click"
      nzOverlayClassName="lang-dropdown"
      class="lang-trigger"
    >
      <nz-icon nzType="global" />
      @if (showLangText) {
        <span class="lang-text">{{ langText }}</span>
        <nz-icon nzType="down" class="lang-arrow" />
      }
    </span>
    <nz-dropdown-menu #langMenu="nzDropdownMenu">
      <ul nz-menu nzSelectable nzType="normal">
        @for (item of langs; track item.code) {
          <li
            nz-menu-item
            [class.selected]="item.code === curLangCode"
            (click)="change(item.code)"
          >
            <span role="img" class="lang-flag">{{ item.abbr }}</span>
            {{ item.text }}
          </li>
        }
      </ul>
    </nz-dropdown-menu>
  `,
  host: {
    '[class.header-i18n]': 'true'
  },
  styles: [`
    :host {
      display: inline-block;
    }
    .lang-trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
    .lang-trigger:hover {
      background: rgba(0, 0, 0, 0.04);
      color: rgba(0, 0, 0, 0.85);
    }
    .lang-text {
      white-space: nowrap;
    }
    .lang-arrow {
      font-size: 10px;
      margin-left: 2px;
    }
    .lang-flag {
      margin-right: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzDropdownModule, NzIconModule, NzMenuModule]
})
export class HeaderI18nComponent {
  private readonly settings = inject(SettingsService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly doc = inject(DOCUMENT);
  /** Whether to display language text */
  @Input({ transform: booleanAttribute }) showLangText = true;

  get langs(): Array<{ code: string; text: string; abbr: string }> {
    return this.i18n.getLangs();
  }

  get curLangCode(): string {
    return this.settings.layout.lang ?? 'zh-CN';
  }

  get langText(): string {
    const text = this.i18n.fanyi('menu.lang');
    return text && text !== 'menu.lang' ? text : (this.curLangCode === 'zh-CN' ? '语言' : 'Language');
  }

  change(lang: string): void {
    if (lang === this.curLangCode) return;

    const spinEl = this.doc.createElement('div');
    spinEl.setAttribute('class', `page-loading ant-spin ant-spin-lg ant-spin-spinning`);
    spinEl.innerHTML = `<span class="ant-spin-dot ant-spin-dot-spin"><i></i><i></i><i></i><i></i></span>`;
    this.doc.body.appendChild(spinEl);

    const removeSpin = () => {
      spinEl?.parentNode?.removeChild(spinEl);
    };

    const persistAndReload = () => {
      this.settings.setLayout('lang', lang);
      // 显式写入 localStorage，确保刷新前 lang 已持久化（与 SettingsService 使用相同 key）
      try {
        const layout = JSON.parse(localStorage.getItem('layout') ?? '{}') || {};
        layout.lang = lang;
        localStorage.setItem('layout', JSON.stringify(layout));
      } catch {
        // ignore
      }
      removeSpin();
      this.doc.location.reload();
    };

    this.i18n.loadLangData(lang).subscribe({
      next: res => {
        if (res && typeof res === 'object') {
          this.i18n.use(lang, res);
        }
        persistAndReload();
      },
      error: () => {
        removeSpin();
      }
    });
  }
}
