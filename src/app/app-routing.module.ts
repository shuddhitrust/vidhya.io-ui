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
import { AddEditUserRoleComponent } from './pages/forms/add-edit-user-role/add-edit-user-role.component';
import { ChatComponent } from './pages/static/chat/chat.component';
import { PasswordResetComponent } from './pages/forms/password-reset/password-reset.component';
// import { InstitutionProfileComponent } from './pages/modals/institution-profile/institution-profile.component';

const routes: Routes = [
  {
    path: uiroutes.DASHBOARD_ROUTE.route,
    component: DashboardComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.DASHBOARD_ROUTE.auth],
  },
  {
    path: uiroutes.PROFILE_ROUTE.route,
    component: ProfileComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.ACCOUNT_ROUTE.route,
    component: AccountComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.ACCOUNT_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.SUPPORT_ROUTE.route,
    component: SupportComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.SUPPORT_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.INSTITUTION_FORM_ROUTE.route,
    component: AddEditInstitutionComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.INSTITUTION_FORM_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.MEMBER_FORM_ROUTE.route,
    component: AddEditMemberComponent,
    canActivate: [RegistrationFormAuthGuard],
    data: [uiroutes.MEMBER_FORM_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.GROUP_FORM_ROUTE.route,
    component: AddEditGroupComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.GROUP_FORM_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.GROUP_PROFILE_ROUTE.route,
    component: GroupProfileComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.GROUP_PROFILE_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ANNOUNCEMENT_FORM_ROUTE.route,
    component: AddEditAnnouncementComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.ANNOUNCEMENT_FORM_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ANNOUNCEMENT_PROFILE_ROUTE.route,
    component: AnnouncementProfileComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.ANNOUNCEMENT_PROFILE_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.COURSE_FORM_ROUTE.route,
    component: AddEditCourseComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.COURSE_FORM_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.ASSIGNMENT_FORM_ROUTE.route,
    component: AddEditAssignmentComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.ASSIGNMENT_FORM_ROUTE.auth],
    pathMatch: 'full',
  },

  {
    path: uiroutes.MEMBER_PROFILE_ROUTE.route,
    component: OwnProfileComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.MEMBER_PROFILE_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.INSTITUTION_PROFILE_ROUTE.route,
    component: InstitutionProfileComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.INSTITUTION_PROFILE_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.USER_ROLE_FORM_ROUTE.route,
    component: AddEditUserRoleComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.USER_ROLE_FORM_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: uiroutes.CHAT_ROUTE.route,
    component: ChatComponent,
    canActivate: [AuthenticationGuard],
    data: [uiroutes.CHAT_ROUTE.auth],
    pathMatch: 'full',
  },
  {
    path: `${uiroutes.ACTIVATE_ACCOUNT_ROUTE.route}/:token`,
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: `${uiroutes.PASSWORD_RESET_ROUTE.route}/:token`,
    component: PasswordResetComponent,
    pathMatch: 'full',
  },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
