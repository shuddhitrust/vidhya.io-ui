import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthenticationGuard,
  RegistrationFormAuthGuard,
} from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditIssueComponent } from './components/add-edit-issue/add-edit-issue.component';
import { IssueProfileComponent } from './components/issue-profile/issue-profile.component';
import { OwnIssuesComponent } from './components/own-issues/own-issues.component';

const routes: Routes = [
  {
    path: uiroutes.ISSUE_PROFILE_ROUTE.route,
    component: IssueProfileComponent,
    canActivate: [RegistrationFormAuthGuard],
    data: uiroutes.ISSUE_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.ISSUE_FORM_ROUTE.route,
    component: AddEditIssueComponent,
    canActivate: [RegistrationFormAuthGuard],
    data: uiroutes.ISSUE_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.OWN_ISSUES_ROUTE.route,
    component: OwnIssuesComponent,
    canActivate: [RegistrationFormAuthGuard],
    data: uiroutes.OWN_ISSUES_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IssueRoutingModule {}
