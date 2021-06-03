import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './pages/static/account/account.component';
import {
  AuthenticationGuard,
  RegistrationFormAuthGuard,
} from './shared/api/authentication.guard';
import { DashboardComponent } from './pages/static/dashboard/dashboard.component';
import { HomeComponent } from './pages/static/home/home.component';
import { ProfileComponent } from './pages/static/profile/profile.component';
import { SupportComponent } from './pages/static/support/support.component';
import { uiroutes } from './shared/common/ui-routes';
import { AddEditInstitutionComponent } from './pages/forms/add-edit-institution/add-edit-institution.component';
import { AddEditMemberComponent } from './pages/forms/add-edit-member/add-edit-member.component';
import { AddEditGroupComponent } from './pages/forms/add-edit-group/add-edit-group.component';
import { GroupProfileComponent } from './pages/profiles/group-profile/group-profile.component';
import { AnnouncementProfileComponent } from './pages/profiles/announcement-profile/announcement-profile.component';
import { AddEditAnnouncementComponent } from './pages/forms/add-edit-announcement/add-edit-announcement.component';
import { OwnProfileComponent } from './pages/profiles/own-user-profile/own-profile.component';
import { AddEditCourseComponent } from './pages/forms/add-edit-course/add-edit-course.component';
import { AddEditAssignmentComponent } from './pages/forms/add-edit-assignment/add-edit-assignment.component';
import { InstitutionProfileComponent } from './pages/profiles/institution-profile/institution-profile.component';
// import { InstitutionProfileComponent } from './pages/modals/institution-profile/institution-profile.component';

const routes: Routes = [
  {
    path: uiroutes.DASHBOARD_ROUTE,
    component: DashboardComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: uiroutes.PROFILE_ROUTE,
    component: ProfileComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.ACCOUNT_ROUTE,
    component: AccountComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.SUPPORT_ROUTE,
    component: SupportComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.INSTITUTION_FORM_ROUTE,
    component: AddEditInstitutionComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.MEMBER_FORM_ROUTE,
    component: AddEditMemberComponent,
    canActivate: [RegistrationFormAuthGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.GROUP_FORM_ROUTE,
    component: AddEditGroupComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.GROUP_PROFILE_ROUTE,
    component: GroupProfileComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ANNOUNCEMENT_FORM_ROUTE,
    component: AddEditAnnouncementComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ANNOUNCEMENT_PROFILE_ROUTE,
    component: AnnouncementProfileComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.COURSE_FORM_ROUTE,
    component: AddEditCourseComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ASSIGNMENT_FORM_ROUTE,
    component: AddEditAssignmentComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },

  {
    path: uiroutes.MEMBER_PROFILE_ROUTE,
    component: OwnProfileComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.INSTITUTION_PROFILE_ROUTE,
    component: InstitutionProfileComponent,
    canActivate: [AuthenticationGuard],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ACTIVATE_ACCOUNT,
    component: HomeComponent,
  },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
