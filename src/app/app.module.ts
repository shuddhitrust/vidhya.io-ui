import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  GraphQLModule,
  TokenUpdater,
} from './shared/api/graphql/graphql.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Styling } from './styling.imports';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './pages/static/dashboard/dashboard.component';
import { HomeComponent } from './pages/static/home/home.component';
import { ProfileComponent } from './pages/static/profile/profile.component';
import { AccountComponent } from './pages/static/account/account.component';
import { SupportComponent } from './pages/static/support/support.component';
import {
  AuthenticationGuard,
  AuthInterceptor,
  RegistrationFormAuthGuard,
} from './shared/api/authentication.guard';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { environment } from 'src/environments/environment';
import { AuthState } from './shared/state/auth/auth.state';
import { NotificationState } from './shared/state/notifications/notification.state';
import { LoadingState } from './shared/state/loading/loading.state';
import { AdminDashboardComponent } from './pages/static/dashboard/tabs/admin-dashboard/admin-dashboard.component';
import { AnnouncementDashboardComponent } from './pages/static/dashboard/tabs/announcement-dashboard/announcement-dashboard.component';
import { AssignmentDashboardComponent } from './pages/static/dashboard/tabs/assignment-dashboard/assignment-dashboard.component';
import { GroupDashboardComponent } from './pages/static/dashboard/tabs/group-dashboard/group-dashboard.component';
import { CourseDashboardComponent } from './pages/static/dashboard/tabs/course-dashboard/course-dashboard.component';
import { ReportDashboardComponent } from './pages/static/dashboard/tabs/report-dashboard/report-dashboard.component';
import { AgGridModule } from 'ag-grid-angular';
import { AddEditInstitutionComponent } from './pages/forms/add-edit-institution/add-edit-institution.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InstitutionProfileRendererComponent } from './shared/cell-renderers/institution-profile/institution-profile-renderer.component';
// import {
//   InstitutionDeleteConfirmationDialog,
//   InstitutionProfileComponent,
// } from './pages/modals/institution-profile/institution-profile.component';
import { InstitutionState } from './shared/state/institutions/institution.state';
import { InstitutionsTableComponent } from './pages/tables/institutions-table/institutions-table.component';
import { MembersTableComponent } from './pages/tables/members-table/members-table.component';
import { MemberState } from './shared/state/members/member.state';
import { MemberProfileRendererComponent } from './shared/cell-renderers/member-profile/member-profile-renderer.component';
import {
  MemberDeleteConfirmationDialog,
  MemberProfileComponent,
} from './pages/modals/member-profile/member-profile.component';
import { AddEditMemberComponent } from './pages/forms/add-edit-member/add-edit-member.component';
import { GroupState } from './shared/state/groups/group.state';
import {
  AddEditGroupComponent,
  GroupMemberReviewDialog,
} from './pages/forms/add-edit-group/add-edit-group.component';
import { MasterGridComponent } from './shared/abstract/master-grid/components/master-grid/master-grid.component';
import { InstitutionAdminsTableComponent } from './pages/tables/institution-admins-table/institution-admins-table.component';
import { ClassAdminsTableComponent } from './pages/tables/class-admin-table/class-admins-table.component';
import { LearnersTableComponent } from './pages/tables/learners-table/learners-table.component';
import { SimpleLoadingSpinnerComponent } from './shared/components/loading/simple-spinner/simple-loading-spinner.component';
import {
  GroupDeleteConfirmationDialog,
  GroupProfileComponent,
} from './pages/profiles/group-profile/group-profile.component';
import { OwnProfileComponent } from './pages/profiles/own-user-profile/own-profile.component';
import { AddEditAnnouncementComponent } from './pages/forms/add-edit-announcement/add-edit-announcement.component';
import {
  AnnouncementDeleteConfirmationDialog,
  AnnouncementProfileComponent,
} from './pages/profiles/announcement-profile/announcement-profile.component';
import { AnnouncementState } from './shared/state/announcements/announcement.state';
import { AwaitingModerationTableComponent } from './pages/tables/awaiting-moderation-table/awaiting-moderation-table.component';
import { OptionsState } from './shared/state/options/options.state';
import { LoginModalComponent } from './pages/modals/login/login-modal.component';
import { HotToastModule } from '@ngneat/hot-toast';
import { PaginatorComponent } from './shared/abstract/master-grid/components/paginator/paginator.component';

/** config angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);

/** config ng-zorro-antd i18n **/
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { CourseState } from './shared/state/courses/course.state';
import { AssignmentState } from './shared/state/assignments/assignment.state';
import { AddEditCourseComponent } from './pages/forms/add-edit-course/add-edit-course.component';
import { AddEditAssignmentComponent } from './pages/forms/add-edit-assignment/add-edit-assignment.component';
import {
  InstitutionDeleteConfirmationDialog,
  InstitutionProfileComponent,
} from './pages/profiles/institution-profile/institution-profile.component';
import {
  InstitutionDeleteConfirmationDialogModal,
  InstitutionModalComponent,
} from './pages/modals/institution-modal/institution-modal.component';
import { RolesTableComponent } from './pages/tables/roles-table/roles-table.component';
import {
  RoleDeleteConfirmationDialog,
  RoleProfileComponent,
} from './pages/modals/role-profile/role-profile.component';
import { UserRoleState } from './shared/state/userRoles/userRole.state';
import { AddEditUserRoleComponent } from './pages/forms/add-edit-user-role/add-edit-user-role.component';
import { ChatComponent } from './pages/static/chat/chat.component';
import { ChatState } from './shared/state/chats/chat.state';
import { PasswordResetComponent } from './pages/forms/password-reset/password-reset.component';
import {
  InfiniteScrollComponent,
  InvertedInfiniteScrollComponent,
} from './shared/abstract/infinite-scroller/infinite-scroller.component';
import {
  UserModerationProfileComponent,
  UserApprovalConfirmationDialog,
  UserDenialConfirmationDialog,
} from './pages/modals/moderate-user/user-moderation.component';
import { UserModerationRendererComponent } from './shared/cell-renderers/user-moderation/user-moderation-renderer.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoadingComponent,
    SimpleLoadingSpinnerComponent,
    DashboardComponent,
    HomeComponent,
    ProfileComponent,
    AccountComponent,
    SupportComponent,
    AdminDashboardComponent,
    AnnouncementDashboardComponent,
    AssignmentDashboardComponent,
    GroupDashboardComponent,
    CourseDashboardComponent,
    ReportDashboardComponent,
    AddEditInstitutionComponent,
    InstitutionProfileRendererComponent,
    MasterGridComponent,
    InstitutionsTableComponent,
    AwaitingModerationTableComponent,
    MembersTableComponent,
    InstitutionAdminsTableComponent,
    ClassAdminsTableComponent,
    LearnersTableComponent,
    MemberProfileRendererComponent,
    MemberProfileComponent,
    AddEditMemberComponent,
    AddEditGroupComponent,
    InstitutionProfileComponent,
    InstitutionDeleteConfirmationDialog,
    GroupProfileComponent,
    AddEditAnnouncementComponent,
    AnnouncementProfileComponent,
    AnnouncementDeleteConfirmationDialog,
    GroupDeleteConfirmationDialog,
    MemberDeleteConfirmationDialog,
    MemberProfileComponent,
    AddEditCourseComponent,
    AddEditAssignmentComponent,
    OwnProfileComponent,
    GroupMemberReviewDialog,
    LoginModalComponent,
    PaginatorComponent,
    InstitutionModalComponent,
    InstitutionDeleteConfirmationDialogModal,
    RolesTableComponent,
    RoleProfileComponent,
    RoleDeleteConfirmationDialog,
    AddEditUserRoleComponent,
    ChatComponent,
    PasswordResetComponent,
    InfiniteScrollComponent,
    InvertedInfiniteScrollComponent,
    UserModerationProfileComponent,
    UserModerationRendererComponent,
    UserApprovalConfirmationDialog,
    UserDenialConfirmationDialog,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    Styling,
    BrowserAnimationsModule,
    AgGridModule.withComponents([]),
    HotToastModule.forRoot(),
    [
      NgxsModule.forRoot(
        [
          AuthState,
          NotificationState,
          LoadingState,
          InstitutionState,
          MemberState,
          GroupState,
          AnnouncementState,
          CourseState,
          AssignmentState,
          OptionsState,
          UserRoleState,
          ChatState,
        ],
        {
          developmentMode: !environment.production,
        }
      ),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ],
    TokenUpdater,
  ],
  providers: [
    AuthenticationGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: NZ_I18N, useValue: en_US },
    RegistrationFormAuthGuard,
    FormBuilder,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
