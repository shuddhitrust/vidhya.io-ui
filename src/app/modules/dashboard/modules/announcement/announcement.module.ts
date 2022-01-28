import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AnnouncementState } from 'src/app/modules/dashboard/modules/announcement/state/announcement.state';
import { AnnouncementRoutingModule } from './announcement-routing.module';
import { AddEditAnnouncementComponent } from './components/add-edit-announcement/add-edit-announcement.component';
import { AnnouncementDashboardComponent } from './components/announcement-dashboard/announcement-dashboard.component';
import { AnnouncementProfileComponent } from './components/announcement-profile/announcement-profile.component';

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
  ],
  exports: [...declarations, ...imports],
})
export class AnnouncementModule {}
