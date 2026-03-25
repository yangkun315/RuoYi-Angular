import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UserService } from '../services/user.service';

@Directive({ selector: '[appHasPermi]', standalone: true })
export class HasPermiDirective {
  private userService = inject(UserService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appHasPermi(permission: string | string[]) {
    const perms = Array.isArray(permission) ? permission : [permission];
    const has = perms.some((p) => this.userService.hasPermi(p));
    this.viewContainer.clear();
    if (has) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
