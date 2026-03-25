import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { LoginService } from '../../core/services/login.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-lock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <div class="lock-box">
      <h2>锁屏</h2>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()">
        <nz-form-item>
          <nz-form-control nzErrorTip="请输入密码">
            <input nz-input type="password" formControlName="password" placeholder="密码" />
          </nz-form-control>
        </nz-form-item>
        <button nz-button nzType="primary" nzBlock [nzLoading]="loading" type="submit">解锁</button>
      </form>
    </div>
  `,
  styles: [`.lock-box { padding: 40px; max-width: 400px; margin: 100px auto; }`]
})
export class LockComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private userService = inject(UserService);

  loading = false;
  form = this.fb.nonNullable.group({ password: ['', Validators.required] });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.loginService.unlockScreen(this.form.value.password!).subscribe({
      next: () => this.router.navigate(['/']),
      complete: () => (this.loading = false)
    });
  }
}
