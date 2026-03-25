import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-box">
      <h1>404</h1>
      <p>页面不存在</p>
      <a routerLink="/">返回首页</a>
    </div>
  `,
  styles: [`
    .error-box { text-align: center; padding: 100px 20px; }
    h1 { font-size: 72px; margin: 0; }
    a { color: #1890ff; }
  `]
})
export class Error404Component {}
