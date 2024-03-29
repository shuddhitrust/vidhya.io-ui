import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthenticationGuard,
  RegistrationFormAuthGuard,
} from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditMemberComponent } from './components/add-edit-member/add-edit-member.component';
import { MemberShipStatusComponent } from './components/member-ship-status/member-ship-status.component';
const routes: Routes = [
  {
    path: uiroutes.MEMBER_FORM_ROUTE.route,
    component: AddEditMemberComponent,
    canActivate: [RegistrationFormAuthGuard],
    data: uiroutes.MEMBER_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.MEMBERSHIPSTATUS_STATE_ROUTE.route,
    component: MemberShipStatusComponent,
    canActivate: [RegistrationFormAuthGuard],
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
