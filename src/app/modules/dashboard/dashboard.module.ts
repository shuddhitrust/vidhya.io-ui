import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { Styling } from 'src/app/styling.imports';
import { ReportDashboardComponent } from './tabs/report-dashboard/report-dashboard.component';
import { CourseDashboardComponent } from './tabs/course-dashboard/course-dashboard.component';
import { AdminDashboardComponent } from './tabs/admin-dashboard/admin-dashboard.component';
import { AnnouncementDashboardComponent } from './tabs/announcement-dashboard/announcement-dashboard.component';
import { AssignmentDashboardComponent } from './tabs/assignment-dashboard/assignment-dashboard.component';
import { GroupDashboardComponent } from './tabs/group-dashboard/group-dashboard.component';
import {
  ExerciseKeyDialog,
  GradingDashboardComponent,
  SubmissionHistoryDialog,
} from './tabs/grading-dashboard/grading-dashboard.component';
import {
  ChapterPublishedComponent,
  ExerciseRubricDialog,
} from '../../pages/profiles/chapter-profile/published/chapter-published.component';
import { ChapterDraftComponent } from '../../pages/profiles/chapter-profile/draft/chapter-draft.component';
import { ChapterProfileComponent } from '../../pages/profiles/chapter-profile/chapter-profile.component';
import { CourseProfileComponent } from '../../pages/profiles/course-profile/course-profile.component';
import {
  UserApprovalConfirmationDialog,
  UserDenialConfirmationDialog,
  UserModerationProfileComponent,
} from '../../pages/modals/moderate-user/user-moderation.component';
import { UserModerationRendererComponent } from 'src/app/shared/cell-renderers/user-moderation/user-moderation-renderer.component';
import { ChatComponent } from '../../pages/static/chat/chat.component';
import { AddEditUserRoleComponent } from '../../pages/forms/add-edit-user-role/add-edit-user-role.component';
import { RoleProfileComponent } from '../../pages/modals/role-profile/role-profile.component';
import { RolesTableComponent } from '../../pages/tables/roles-table/roles-table.component';
import { LoginModalComponent } from '../../pages/modals/login/login-modal.component';
import { AddEditGroupComponent } from '../../pages/forms/add-edit-group/add-edit-group.component';
import { OwnProfileComponent } from '../../pages/profiles/own-user-profile/own-profile.component';
import { AddEditChapterComponent } from '../../pages/forms/add-edit-chapter/add-edit-chapter.component';
import { AddEditCourseComponent } from '../../pages/forms/add-edit-course/add-edit-course.component';
import { MemberProfileComponent } from '../../pages/modals/member-profile/member-profile.component';
import { GroupProfileComponent } from '../../pages/profiles/group-profile/group-profile.component';
import { AnnouncementProfileComponent } from '../../pages/profiles/announcement-profile/announcement-profile.component';
import { AddEditAnnouncementComponent } from '../../pages/forms/add-edit-announcement/add-edit-announcement.component';
import { MemberProfileRendererComponent } from 'src/app/shared/cell-renderers/member-profile/member-profile-renderer.component';
import { LearnersTableComponent } from '../../pages/tables/learners-table/learners-table.component';
import { ClassAdminsTableComponent } from '../../pages/tables/class-admin-table/class-admins-table.component';
import { MembersTableComponent } from '../../pages/tables/members-table/members-table.component';
import { AwaitingModerationTableComponent } from '../../pages/tables/awaiting-moderation-table/awaiting-moderation-table.component';
import { MasterGridComponent } from 'src/app/shared/abstract/master-grid/components/master-grid/master-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CourseSectionModalComponent } from '../../pages/modals/course-section-modal/course-section-modal.component';
import { NgxsModule } from '@ngxs/store';
import { HotToastModule } from '@ngneat/hot-toast';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { NotificationState } from 'src/app/shared/state/notifications/notification.state';
import { LoadingState } from 'src/app/shared/state/loading/loading.state';
import { MemberState } from 'src/app/shared/state/members/member.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { AnnouncementState } from 'src/app/shared/state/announcements/announcement.state';
import { CourseState } from 'src/app/shared/state/courses/course.state';
import { AssignmentState } from 'src/app/shared/state/assignments/assignment.state';
import { CourseSectionState } from 'src/app/shared/state/courseSections/courseSection.state';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import { ExerciseState } from 'src/app/shared/state/exercises/exercise.state';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';
import { ExerciseKeyState } from 'src/app/shared/state/exerciseKeys/exerciseKey.state';
import { ReportState } from 'src/app/shared/state/reports/report.state';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { UserRoleState } from 'src/app/shared/state/userRoles/userRole.state';
import { ChatState } from 'src/app/shared/state/chats/chat.state';
import { SubscriptionsState } from 'src/app/shared/state/subscriptions/subscriptions.state';
import { environment } from 'src/environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { MasterConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { InstitutionModule } from '../institution/institution.module';
import { MasterGridModule } from 'src/app/shared/abstract/master-grid/master-grid.module';
import { InstitutionAdminsTableComponent } from 'src/app/pages/tables/institution-admins-table/institution-admins-table.component';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.blockquote = (text: string) => {
    return '<blockquote class="blockquote"><p>' + text + '</p></blockquote>';
  };

  const linkRenderer = renderer.link;
  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
  };

  return {
    renderer: renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  };
}

@NgModule({
  declarations: [
    DashboardComponent,
    AdminDashboardComponent,
    AnnouncementDashboardComponent,
    AssignmentDashboardComponent,
    CourseDashboardComponent,
    GroupDashboardComponent,
    GradingDashboardComponent,
    ReportDashboardComponent,
    // MasterGridComponent,
    AwaitingModerationTableComponent,
    MembersTableComponent,
    InstitutionAdminsTableComponent,

    ClassAdminsTableComponent,
    LearnersTableComponent,
    MemberProfileRendererComponent,
    MemberProfileComponent,
    AddEditGroupComponent,
    GroupProfileComponent,
    AddEditAnnouncementComponent,
    AnnouncementProfileComponent,
    MemberProfileComponent,
    AddEditCourseComponent,
    AddEditChapterComponent,
    OwnProfileComponent,
    LoginModalComponent,
    RolesTableComponent,
    RoleProfileComponent,
    AddEditUserRoleComponent,
    ChatComponent,
    UserModerationProfileComponent,
    UserModerationRendererComponent,
    UserApprovalConfirmationDialog,
    UserDenialConfirmationDialog,
    GradingDashboardComponent,
    CourseProfileComponent,
    ChapterProfileComponent,
    ChapterDraftComponent,
    ChapterPublishedComponent,
    ExerciseKeyDialog,
    CourseSectionModalComponent,
    MasterConfirmationDialog,
    ExerciseRubricDialog,
    ImageDisplayDialog,
    SubmissionHistoryDialog,
  ],
  exports: [MasterGridComponent],
  imports: [
    SharedModule,
    MasterGridModule,
    InstitutionModule,
    InfiniteScrollModule,
    LMarkdownEditorModule,
    HotToastModule.forRoot(),
    [
      NgxsModule.forRoot(
        [
          AuthState,
          NotificationState,
          LoadingState,
          MemberState,
          GroupState,
          AnnouncementState,
          AssignmentState,
          CourseState,
          CourseSectionState,
          ChapterState,
          ExerciseState,
          ExerciseSubmissionState,
          ExerciseKeyState,
          ReportState,
          OptionsState,
          UserRoleState,
          ChatState,
          SubscriptionsState,
        ],
        {
          developmentMode: !environment.production,
        }
      ),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ],
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    DashboardRoutingModule,
    Styling,
  ],
})
export class DashboardModule {}