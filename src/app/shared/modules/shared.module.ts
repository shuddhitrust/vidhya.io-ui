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

const imports = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  Styling,
  MasterGridModule,
  InfiniteScrollModule,
];

const declarations = [SimpleLoadingSpinnerComponent];

@NgModule({
  declarations,
  imports: [
    ...imports,
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
