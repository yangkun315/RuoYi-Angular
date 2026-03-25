import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NzCardModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <h2 class="mb-md">个人设置</h2>
    <nz-card nzTitle="基本资料" class="mb-md">
      <p class="text-muted">昵称、手机、邮箱等可在若依后台「个人信息」接口联调后在此编辑。</p>
      <div>当前用户：{{ userService.user()?.userName }}（{{ userService.user()?.nickName }}）</div>
    </nz-card>
    <nz-card nzTitle="修改密码">
      <form nz-form nzLayout="vertical" class="max-w-md">
        <nz-form-item>
          <nz-form-label>旧密码</nz-form-label>
          <nz-form-control>
            <input nz-input type="password" name="oldPwd" [(ngModel)]="oldPassword" autocomplete="current-password" />
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>新密码</nz-form-label>
          <nz-form-control>
            <input nz-input type="password" name="newPwd" [(ngModel)]="newPassword" autocomplete="new-password" />
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>确认新密码</nz-form-label>
          <nz-form-control>
            <input nz-input type="password" name="confirmPwd" [(ngModel)]="confirmPassword" autocomplete="new-password" />
          </nz-form-control>
        </nz-form-item>
        <button nz-button nzType="primary" type="button" [disabled]="submitting" (click)="onSubmit()">保存</button>
      </form>
    </nz-card>
  `,
  styles: [
    `
      .mb-md {
        margin-bottom: 16px;
      }
      .text-muted {
        color: rgba(0, 0, 0, 0.45);
        margin-bottom: 8px;
      }
      .max-w-md {
        max-width: 400px;
      }
    `
  ]
})
export class UserSettingsComponent {
  readonly userService = inject(UserService);
  private readonly msg = inject(NzMessageService);

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  submitting = false;

  onSubmit(): void {
    if (!this.oldPassword || !this.newPassword) {
      this.msg.warning('请填写旧密码与新密码');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.msg.error('两次新密码不一致');
      return;
    }
    this.submitting = true;
    this.msg.info('改密接口待对接若依 /system/user/profile/resetPwd 等');
    this.submitting = false;
  }
}
