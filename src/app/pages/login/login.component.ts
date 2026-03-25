import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { LoginService } from '../../core/services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private loginService = inject(LoginService);

  loading = signal(false);
  captchaEnabled = signal(true);
  captchaImg = signal('');
  uuid = signal('');

  form = this.fb.nonNullable.group({
    username: ['admin', [Validators.required]],
    password: ['admin123', [Validators.required]],
    rememberMe: [false],
    code: ['', [Validators.required]]
  });

  ngOnInit() {
    this.getCode();
  }

  getCode() {
    this.loginService.getCodeImg().subscribe({
      next: (res) => {
        this.captchaEnabled.set(res.captchaEnabled ?? true);
        if (res.captchaEnabled) {
          this.captchaImg.set(res.img ?? '');
          this.uuid.set(res.uuid ?? '');
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsDirty());
      return;
    }
    const { username, password, code } = this.form.getRawValue();
    this.loading.set(true);
    this.userService.login(username, password, code, this.uuid()).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.userService.getInfo();
        this.router.navigate(['/']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
