import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AssignmentDashboardComponent } from './components/assignment-dashboard/assignment-dashboard.component';
import { AssignmentState } from './state/assignment.state';

const declarations = [AssignmentDashboardComponent];
const imports = [SharedModule, InfiniteScrollModule];

@NgModule({
  declarations,
  imports: [...imports, NgxsModule.forFeature([AssignmentState])],
  exports: [...declarations, ...imports],
})
export class AssignmentModule {}
