import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthenticationGuard,
  RegistrationFormAuthGuard,
} from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditMemberComponent } from './components/add-edit-member/add-edit-member.component';
import { OwnProfileComponent } from './components/own-user-profile/own-profile.component';

const routes: Routes = [
  {
    path: uiroutes.OWN_PROFILE_ROUTE.route,
    component: OwnProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.OWN_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.MEMBER_FORM_ROUTE.route,
    component: AddEditMemberComponent,
    canActivate: [RegistrationFormAuthGuard],
    data: uiroutes.MEMBER_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
