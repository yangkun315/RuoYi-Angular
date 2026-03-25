import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { UserService } from '../../services/user.service';
import { PermissionService } from '../../services/permission.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NzLayoutModule, NzMenuModule, NzIconModule, NzDropDownModule, SidebarComponent],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  collapsed = false;

  constructor(
    public userService: UserService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    if (!this.userService.user()) {
      this.userService.getInfo();
    }
    this.permissionService.loadRoutes();
  }

  logout() {
    this.userService.logout();
  }
}
