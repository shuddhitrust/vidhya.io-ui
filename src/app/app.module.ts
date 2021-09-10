import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  GraphQLModule,
  TokenUpdater,
} from './shared/api/graphql/graphql.module';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Styling } from './styling.imports';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { AgGridModule } from 'ag-grid-angular';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

// import {
//   InstitutionDeleteConfirmationDialog,
//   InstitutionProfileComponent,
// } from './pages/modals/institution-profile/institution-profile.component';
import { InstitutionState } from './shared/state/institutions/institution.state';
import { MemberState } from './shared/state/members/member.state';
import { GroupState } from './shared/state/groups/group.state';

import { SimpleLoadingSpinnerComponent } from './shared/components/loading/simple-spinner/simple-loading-spinner.component';
import { AnnouncementState } from './shared/state/announcements/announcement.state';
import { OptionsState } from './shared/state/options/options.state';
import { HotToastModule } from '@ngneat/hot-toast';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
/** Date picker date format */

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

/** config angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);

/** config ng-zorro-antd i18n **/
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { CourseState } from './shared/state/courses/course.state';
import { ChapterState } from './shared/state/chapters/chapter.state';

import { UserRoleState } from './shared/state/userRoles/userRole.state';

import { ChatState } from './shared/state/chats/chat.state';
import { PasswordResetComponent } from './pages/forms/password-reset/password-reset.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CourseSectionState } from './shared/state/courseSections/courseSection.state';
import { ExerciseState } from './shared/state/exercises/exercise.state';
import { ExerciseSubmissionState } from './shared/state/exerciseSubmissions/exerciseSubmission.state';
import { ReportState } from './shared/state/reports/report.state';
import { PrivacyComponent } from './pages/static/privacy/privacy.component';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  CourseDeleteConfirmationDialog,
  CourseProfileComponent,
} from './pages/profiles/course-profile/course-profile.component';
import {
  NgxMatDateFormats,
  NGX_MAT_DATE_FORMATS,
} from '@angular-material-components/datetime-picker';
import { ChapterDraftComponent } from './pages/profiles/chapter-profile/draft/chapter-draft.component';
import { ChapterPublishedComponent } from './pages/profiles/chapter-profile/published/chapter-published.component';
import {
  ChapterProfileComponent,
  ChapterDeleteConfirmationDialog,
  ExercicseDeleteConfirmationDialog,
} from './pages/profiles/chapter-profile/chapter-profile.component';
import { ExerciseKeyState } from './shared/state/exerciseKeys/exerciseKey.state';
import { AssignmentState } from './shared/state/assignments/assignment.state';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { DragDropComponent } from './shared/components/drag-drop/drag-drop.component';
import {
  CourseSectionModalComponent,
  CouseSectionDeleteConfirmationDialog,
} from './pages/modals/course-section-modal/course-section-modal.component';
import { SubscriptionsState } from './shared/state/subscriptions/subscriptions.state';
import { DashboardModule } from './pages/static/dashboard/dashboard.module';
import { AddEditMemberComponent } from './pages/forms/add-edit-member/add-edit-member.component';

// function that returns `MarkedOptions` with renderer override

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoadingComponent,
    HomeComponent,
    ProfileComponent,
    AccountComponent,
    SupportComponent,
    PasswordResetComponent,
    PrivacyComponent,
    DragDropComponent,
    AddEditMemberComponent,
  ],
  // exports: [SimpleLoadingSpinnerComponent],
  imports: [
    DashboardModule,
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    Styling,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    TokenUpdater,
    ScullyLibModule,
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
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
