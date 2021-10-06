import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ReportDashboardComponent } from './tabs/report-dashboard/report-dashboard.component';
import { CourseDashboardComponent } from './tabs/course-dashboard/course-dashboard.component';
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
import { ChatComponent } from '../../pages/static/chat/chat.component';
import { LoginModalComponent } from '../../pages/modals/login/login-modal.component';
import { AddEditGroupComponent } from '../../pages/forms/add-edit-group/add-edit-group.component';
import { AddEditChapterComponent } from '../../pages/forms/add-edit-chapter/add-edit-chapter.component';
import { AddEditCourseComponent } from '../../pages/forms/add-edit-course/add-edit-course.component';
import { GroupProfileComponent } from '../../pages/profiles/group-profile/group-profile.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CourseSectionModalComponent } from '../../pages/modals/course-section-modal/course-section-modal.component';
import { NgxsModule } from '@ngxs/store';
import { HotToastModule } from '@ngneat/hot-toast';
import { NotificationState } from 'src/app/shared/state/notifications/notification.state';
import { LoadingState } from 'src/app/shared/state/loading/loading.state';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { CourseState } from 'src/app/shared/state/courses/course.state';
import { AssignmentState } from 'src/app/shared/state/assignments/assignment.state';
import { CourseSectionState } from 'src/app/shared/state/courseSections/courseSection.state';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import { ExerciseState } from 'src/app/shared/state/exercises/exercise.state';
import { ExerciseSubmissionState } from 'src/app/shared/state/exerciseSubmissions/exerciseSubmission.state';
import { ExerciseKeyState } from 'src/app/shared/state/exerciseKeys/exerciseKey.state';
import { ReportState } from 'src/app/shared/state/reports/report.state';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { ChatState } from 'src/app/shared/state/chats/chat.state';
import { SubscriptionsState } from 'src/app/shared/state/subscriptions/subscriptions.state';
import { environment } from 'src/environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { MasterConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { MasterGridModule } from 'src/app/shared/abstract/master-grid/master-grid.module';
import { ReportsTableComponent } from './../../pages/tables/reports-table/reports-table.component';
import { AdminModule } from './modules/admin/admin.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { markedOptionsFactory } from 'src/app/shared/common/constants';

@NgModule({
  declarations: [
    DashboardComponent,
    AssignmentDashboardComponent,
    CourseDashboardComponent,
    GroupDashboardComponent,
    GradingDashboardComponent,
    ReportDashboardComponent,
    AddEditGroupComponent,
    GroupProfileComponent,
    AddEditCourseComponent,
    AddEditChapterComponent,
    LoginModalComponent,
    ChatComponent,
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
    ReportsTableComponent,
  ],
  imports: [
    SharedModule,
    MasterGridModule,
    InfiniteScrollModule,
    LMarkdownEditorModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    HotToastModule.forRoot(),
    [
      NgxsModule.forRoot(
        [
          NotificationState,
          LoadingState,
          MemberState,
          GroupState,
          AssignmentState,
          CourseState,
          CourseSectionState,
          ChapterState,
          ExerciseState,
          ExerciseSubmissionState,
          ExerciseKeyState,
          ReportState,
          OptionsState,
          ChatState,
          SubscriptionsState,
        ],
        {
          developmentMode: !environment.production,
        }
      ),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ],
    AdminModule,
    AnnouncementModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
