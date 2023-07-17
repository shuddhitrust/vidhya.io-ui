import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
// import { MasterGridModule } from 'src/app/shared/modules/master-grid/master-grid.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AddEditGroupComponent } from './components/add-edit-group/add-edit-group.component';
import { GroupDashboardComponent } from './components/group-dashboard/group-dashboard.component';
import { GroupProfileComponent } from './components/group-profile/group-profile.component';
import { GroupRoutingModule } from './group-routing.module';
import { GroupState } from './state/group.state';

const declarations = [
  GroupDashboardComponent,
  GroupProfileComponent,
  AddEditGroupComponent,
];
const imports = [SharedModule];

@NgModule({
  declarations,
  imports: [
    ...imports,
    NgxsModule.forFeature([GroupState]),
    GroupRoutingModule,
  ],
  exports: [...declarations, ...imports],
})
export class GroupModule {}
