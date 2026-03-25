import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-build',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './build.component.html',
  styles: [
    `
      .ry-build-title {
        font-weight: 500;
        margin-right: 8px;
      }
      .ry-build-desc {
        color: rgba(0, 0, 0, 0.55);
        font-size: 13px;
        max-width: 520px;
      }
      .ry-build-frame-wrap {
        padding: 0;
        overflow: hidden;
      }
      .ry-build-iframe {
        display: block;
        width: 100%;
        height: calc(100vh - 200px);
        min-height: 560px;
        border: none;
      }
    `
  ]
})
export class BuildComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('builderFrame') builderFrame?: ElementRef<HTMLIFrameElement>;

  readonly builderUrl =
    (environment as { formBuilderUrl?: string }).formBuilderUrl ?? 'https://mrhj.gitee.io/form-generator/#/';

  safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.builderUrl);

  reloadFrame(): void {
    const el = this.builderFrame?.nativeElement;
    if (el) {
      el.src = this.builderUrl;
    }
    this.cdr.markForCheck();
  }
}
