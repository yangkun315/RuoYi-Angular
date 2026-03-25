import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="register-box">
      <h2>用户注册</h2>
      <p>注册功能开发中，请联系管理员。</p>
      <a routerLink="/login">返回登录</a>
    </div>
  `,
  styles: [`
    .register-box { padding: 40px; text-align: center; }
    a { color: #1890ff; }
  `]
})
export class RegisterComponent {}
