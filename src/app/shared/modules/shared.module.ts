import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Styling } from 'src/app/styling.imports';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MasterGridModule } from './master-grid/master-grid.module';
import { SimpleLoadingSpinnerComponent } from '../components/loading/simple-spinner/simple-loading-spinner.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxsModule } from '@ngxs/store';
import { OptionsState } from '../state/options/options.state';
import { NotificationState } from '../state/notifications/notification.state';
import { LoadingState } from '../state/loading/loading.state';
import { SubscriptionsState } from '../state/subscriptions/subscriptions.state';
import { ScrollTopComponent } from '../components/scroll-to-top/scroll-to-top.component';
import { AnnouncementProfileRendererComponent } from '../components/announcement-profile-renderer/announcement-profile-renderer.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { markedOptionsFactory } from '../common/constants';

const imports = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  Styling,
  MasterGridModule,
  InfiniteScrollModule,
];

const declarations = [
  SimpleLoadingSpinnerComponent,
  ScrollTopComponent,
  AnnouncementProfileRendererComponent,
];

@NgModule({
  declarations,
  imports: [
    ...imports,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    NgxsModule.forFeature([
      OptionsState,
      SubscriptionsState,
      NotificationState,
      LoadingState,
    ]),
  ],
  exports: [...imports, ...declarations],
})
export class SharedModule {}
