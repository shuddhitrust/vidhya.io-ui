import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthenticationGuard,
  RegistrationFormAuthGuard,
} from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditMemberComponent } from './components/add-edit-member/add-edit-member.component';

const routes: Routes = [
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
