import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditUserRoleComponent } from './components/forms/add-edit-user-role/add-edit-user-role.component';

const routes: Routes = [
  {
    path: uiroutes.USER_ROLE_FORM_ROUTE.route,
    component: AddEditUserRoleComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.USER_ROLE_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoleRoutingModule {}
