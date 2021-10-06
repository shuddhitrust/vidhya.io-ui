import { NgModule } from '@angular/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AssignmentDashboardComponent } from './components/assignment-dashboard/assignment-dashboard.component';

const declarations = [AssignmentDashboardComponent];
const imports = [SharedModule, InfiniteScrollModule];

@NgModule({
  declarations,
  imports,
  exports: [...declarations, ...imports],
})
export class AssignmentModule {}
