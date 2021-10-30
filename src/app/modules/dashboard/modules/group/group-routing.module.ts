import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditGroupComponent } from './components/add-edit-group/add-edit-group.component';
import { GroupProfileComponent } from './components/group-profile/group-profile.component';

const routes: Routes = [
  {
    path: uiroutes.GROUP_FORM_ROUTE.route,
    component: AddEditGroupComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.GROUP_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.GROUP_PROFILE_ROUTE.route,
    component: GroupProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.GROUP_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupRoutingModule {}
