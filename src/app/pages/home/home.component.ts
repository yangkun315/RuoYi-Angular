import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome">
      <h2>欢迎使用若依管理系统</h2>
      <p>当前用户：{{ userService.user()?.nickName || userService.user()?.userName || '-' }}</p>
    </div>
  `
})
export class HomeComponent {
  constructor(public userService: UserService) {}
}
