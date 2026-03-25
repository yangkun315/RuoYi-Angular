import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-swagger',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './swagger.component.html',
  styles: [
    `
      .ry-swagger-title {
        font-weight: 500;
        margin-right: 8px;
      }
      .ry-swagger-desc {
        color: rgba(0, 0, 0, 0.55);
        font-size: 13px;
      }
      .ry-swagger-frame-wrap {
        padding: 0;
        overflow: hidden;
      }
      .ry-swagger-iframe {
        display: block;
        width: 100%;
        height: calc(100vh - 200px);
        min-height: 560px;
        border: none;
      }
    `
  ]
})
export class SwaggerComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('swaggerFrame') swaggerFrame?: ElementRef<HTMLIFrameElement>;

  /** 与 iframe 同源路径，走 dev 代理或生产部署的 API 前缀 */
  readonly swaggerPageUrl = `${(environment.api?.baseUrl ?? '/dev-api').replace(/\/$/, '')}/swagger-ui/index.html`;

  swaggerUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.swaggerPageUrl);

  reloadFrame(): void {
    const el = this.swaggerFrame?.nativeElement;
    if (el) {
      el.src = this.swaggerPageUrl;
    }
    this.cdr.markForCheck();
  }
}
