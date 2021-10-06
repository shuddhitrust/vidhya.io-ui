import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ReportDashboardComponent } from './tabs/report-dashboard/report-dashboard.component';
import { GroupDashboardComponent } from './modules/group/components/group-dashboard/group-dashboard.component';
import { ChatComponent } from '../../pages/static/chat/chat.component';
import { LoginModalComponent } from '../../pages/modals/login/login-modal.component';
import { AddEditGroupComponent } from './modules/group/components/add-edit-group/add-edit-group.component';
import { GroupProfileComponent } from './modules/group/components/group-profile/group-profile.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxsModule } from '@ngxs/store';
import { HotToastModule } from '@ngneat/hot-toast';
import { NotificationState } from 'src/app/shared/state/notifications/notification.state';
import { LoadingState } from 'src/app/shared/state/loading/loading.state';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
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
import { CourseModule } from './modules/course/course.module';
import { GradingModule } from './modules/grading/grading.module';
import { ReportModule } from './modules/report/report.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { GroupModule } from './modules/group/group.module';

@NgModule({
  declarations: [
    DashboardComponent,
    ReportDashboardComponent,
    LoginModalComponent,
    ChatComponent,
    MasterConfirmationDialog,
    ImageDisplayDialog,
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
    AssignmentModule,
    CourseModule,
    GradingModule,
    GroupModule,
    ReportModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
