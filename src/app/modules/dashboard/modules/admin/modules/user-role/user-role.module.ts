import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { MasterGridModule } from 'src/app/shared/abstract/master-grid/master-grid.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { RoleProfileRendererComponent } from './components/cell-renderers/role-profile/role-profile-renderer.component';
import { AddEditUserRoleComponent } from './components/forms/add-edit-user-role/add-edit-user-role.component';
import { RoleProfileComponent } from './components/profiles/role-profile/role-profile.component';
import { RolesTableComponent } from './components/tables/roles-table/roles-table.component';
import { UserRoleState } from './state/userRole.state';

const declarations = [
  AddEditUserRoleComponent,
  RoleProfileComponent,
  RoleProfileRendererComponent,
  RolesTableComponent,
];
const imports = [SharedModule, MasterGridModule];

@NgModule({
  declarations,
  imports: [...imports, NgxsModule.forFeature([UserRoleState])],
  exports: [...declarations, ...imports],
})
export class UserRoleModule {}
