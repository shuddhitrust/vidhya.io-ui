import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { markedOptionsFactory } from 'src/app/shared/common/constants';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AnnouncementState } from 'src/app/modules/dashboard/modules/announcement/state/announcement.state';
import { AnnouncementRoutingModule } from './announcement-routing.module';
import { AddEditAnnouncementComponent } from './components/add-edit-announcement/add-edit-announcement.component';
import { AnnouncementDashboardComponent } from './components/announcement-dashboard/announcement-dashboard.component';
import { AnnouncementProfileComponent } from './components/announcement-profile/announcement-profile.component';
import { DashboardState } from '../../state/dashboard.state';

const declarations = [
  AnnouncementDashboardComponent,
  AddEditAnnouncementComponent,
  AnnouncementProfileComponent,
];
const imports = [SharedModule, InfiniteScrollModule, LMarkdownEditorModule];

@NgModule({
  declarations,
  imports: [
    ...imports,
    AnnouncementRoutingModule,
    NgxsModule.forFeature([AnnouncementState]),
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
  ],
  exports: [...declarations, ...imports],
})
export class AnnouncementModule {}
