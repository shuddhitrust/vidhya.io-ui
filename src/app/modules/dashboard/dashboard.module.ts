import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { LoginModalComponent } from '../auth/components/login/login-modal.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HotToastModule } from '@ngneat/hot-toast';
import { MasterConfirmationDialog } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ImageDisplayDialog } from 'src/app/shared/components/image-display/image-display-dialog.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { MasterGridModule } from 'src/app/shared/modules/master-grid/master-grid.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { markedOptionsFactory } from 'src/app/shared/common/constants';
import { CourseModule } from './modules/course/course.module';
import { GradingModule } from './modules/grading/grading.module';
import { ReportModule } from './modules/report/report.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { GroupModule } from './modules/group/group.module';
// import { ChatModule } from './modules/chat/chat.module';

@NgModule({
  declarations: [
    DashboardComponent,
    LoginModalComponent,
    MasterConfirmationDialog,
    ImageDisplayDialog,
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
    AdminModule,
    AnnouncementModule,
    AssignmentModule,
    CourseModule,
    GradingModule,
    GroupModule,
    ReportModule,
    // ChatModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
