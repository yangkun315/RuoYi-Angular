import { ChangeDetectorRef, Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from '@delon/theme';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { UserApi } from '../../api/system/user.api';
import type { SysUser } from '../../core/types/api/system/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    NzGridModule,
    NzCardModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzRadioModule,
    NzAvatarModule,
    NzIconModule,
    NzModalModule,
    ImageCropperComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.less'
})
export class ProfileComponent implements OnInit {
  private readonly userApi = inject(UserApi);
  private readonly userService = inject(UserService);
  private readonly settings = inject(SettingsService);
  private readonly msg = inject(NzMessageService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  private readonly avatarFileInput = viewChild<ElementRef<HTMLInputElement>>('avatarFileInput');
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayUser = signal<SysUser | null>(null);
  readonly roleGroup = signal<string>('');

  form: Partial<SysUser> = {};
  pwd = { oldPassword: '', newPassword: '', confirmPassword: '' };
  savingProfile = false;
  savingPwd = false;

  avatarModalVisible = false;
  imageChangedEvent: Event | null = null;
  /** 用 signal 驱动裁剪 transform，确保 OnPush 的 image-cropper 能收到每次缩放/旋转 */
  readonly cropTransformSig = signal<ImageTransform>({});
  croppedBlob: Blob | null = null;
  previewUrl: string | null = null;
  uploadingAvatar = false;

  readonly avatarUrl = computed(() => {
    const a = this.displayUser()?.avatar;
    if (!a) return undefined;
    if (a.startsWith('http') || a.startsWith('data:')) return a;
    return a.startsWith('/') ? a : `/${a}`;
  });

  deptDisplay(): string {
    const u = this.displayUser();
    const name = u?.dept?.deptName;
    return name?.trim() ? name : '—';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userApi.getUserProfile().subscribe({
      next: res => {
        const u = res.data;
        if (u) {
          this.displayUser.set(u);
          this.roleGroup.set(res.roleGroup ?? '');
          this.patchForm(u);
        } else {
          this.applyFallbackUser();
        }
      },
      error: () => this.applyFallbackUser()
    });
  }

  private patchForm(u: SysUser): void {
    const sex = u.sex === '0' || u.sex === '1' ? u.sex : '0';
    this.form = {
      userId: u.userId,
      nickName: u.nickName,
      phonenumber: u.phonenumber,
      email: u.email,
      sex
    };
  }

  private applyFallbackUser(): void {
    const u = this.userService.user() as SysUser | null | undefined;
    if (u) {
      this.displayUser.set(u);
      const roles = this.userService.roles();
      this.roleGroup.set(roles.length ? roles.join('，') : '');
      this.patchForm(u);
    } else {
      this.displayUser.set(null);
      this.roleGroup.set('');
      this.form = { sex: '0' };
    }
  }

  saveProfile(): void {
    if (!this.form.nickName?.trim()) {
      this.msg.error('请输入用户昵称');
      return;
    }
    if (!this.form.phonenumber?.trim()) {
      this.msg.error('请输入手机号码');
      return;
    }
    if (!this.form.email?.trim()) {
      this.msg.error('请输入邮箱');
      return;
    }
    const base = this.displayUser();
    if (!base?.userId) {
      this.msg.warning('未获取到用户编号，请确认已登录且接口 /system/user/profile 可用');
      return;
    }
    this.savingProfile = true;
    const payload: SysUser = {
      ...base,
      ...this.form,
      userId: base.userId
    };
    this.userApi.updateUserProfile(payload).subscribe({
      next: r => {
        if (r.code === 200) {
          this.msg.success(r.msg || '保存成功');
          this.userService.getInfo();
          this.loadProfile();
        } else {
          this.msg.error(r.msg || '保存失败');
        }
      },
      error: () => this.msg.error('保存失败'),
      complete: () => {
        this.savingProfile = false;
      }
    });
  }

  savePassword(): void {
    if (!this.pwd.oldPassword || !this.pwd.newPassword) {
      this.msg.warning('请填写旧密码和新密码');
      return;
    }
    if (this.pwd.newPassword !== this.pwd.confirmPassword) {
      this.msg.error('两次输入的新密码不一致');
      return;
    }
    this.savingPwd = true;
    this.userApi.updateUserPwd(this.pwd.oldPassword, this.pwd.newPassword).subscribe({
      next: r => {
        if (r.code === 200) {
          this.msg.success(r.msg || '修改成功');
          this.pwd = { oldPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          this.msg.error(r.msg || '修改失败');
        }
      },
      error: () => this.msg.error('修改失败'),
      complete: () => {
        this.savingPwd = false;
      }
    });
  }

  closePage(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigate(['/dashboard/welcome']);
    }
  }

  openAvatarModal(): void {
    this.avatarModalVisible = true;
    this.imageChangedEvent = null;
    this.cropTransformSig.set({});
    this.croppedBlob = null;
    this.revokePreview();
  }

  closeAvatarModal(): void {
    this.avatarModalVisible = false;
    this.revokePreview();
    this.imageChangedEvent = null;
    this.croppedBlob = null;
    this.cropTransformSig.set({});
    const inp = this.avatarFileInput()?.nativeElement;
    if (inp) inp.value = '';
  }

  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  triggerAvatarFilePick(): void {
    this.avatarFileInput()?.nativeElement.click();
  }

  onAvatarFileChange(ev: Event): void {
    this.imageChangedEvent = ev;
    this.cropTransformSig.set({});
    this.croppedBlob = null;
    this.revokePreview();
  }

  /** 图片进入画布后再推一次 transform，避免加载早期 ngOnChanges 提前 return 导致 scale 未生效 */
  onCropperImageLoaded(): void {
    queueMicrotask(() => {
      this.cropTransformSig.update(t => ({ ...t, scale: t.scale ?? 1 }));
      this.cdr.detectChanges();
    });
  }

  onImageCropped(e: ImageCroppedEvent): void {
    if (e.blob) {
      this.croppedBlob = e.blob;
      this.revokePreview();
      this.previewUrl = URL.createObjectURL(e.blob);
    }
  }

  zoomCrop(delta: number): void {
    this.cropTransformSig.update(t => {
      const s = (t.scale ?? 1) + delta;
      return { ...t, scale: Math.min(5, Math.max(0.5, s)) };
    });
    this.cdr.detectChanges();
  }

  rotateCrop(deg: number): void {
    this.cropTransformSig.update(t => ({
      ...t,
      rotate: (t.rotate ?? 0) + deg
    }));
    this.cdr.detectChanges();
  }

  submitAvatar(): void {
    if (!this.croppedBlob) {
      this.msg.warning('请先选择图片并完成裁剪');
      return;
    }
    this.uploadingAvatar = true;
    this.userApi.uploadAvatar(this.croppedBlob, 'avatar.png').subscribe({
      next: r => {
        if (r.code === 200) {
          this.msg.success(r.msg || '头像更新成功');
          const raw = r as unknown as { imgUrl?: string; data?: string | { imgUrl?: string } };
          let url = raw.imgUrl;
          if (!url && raw.data) {
            url = typeof raw.data === 'string' ? raw.data : raw.data.imgUrl;
          }
          if (url) {
            this.settings.setUser({ ...this.settings.user, avatar: url });
          }
          this.userService.getInfo();
          this.loadProfile();
          this.closeAvatarModal();
        } else {
          this.msg.error(r.msg || '上传失败');
        }
      },
      error: () => this.msg.error('上传失败'),
      complete: () => {
        this.uploadingAvatar = false;
      }
    });
  }
}
