import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UserService } from '../services/user.service';

@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective {
  private userService = inject(UserService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appHasRole(role: string | string[]) {
    const roles = Array.isArray(role) ? role : [role];
    const has = roles.some((r) => this.userService.hasRole(r));
    this.viewContainer.clear();
    if (has) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
