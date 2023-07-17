import { NgModule } from '@angular/core';
import { InstitutionAdminsTableComponent } from './components/tables/institution-admins-table/institution-admins-table.component';
import { LearnersTableComponent } from './components/tables/learners-table/learners-table.component';
import { MembersTableComponent } from './components/tables/members-table/members-table.component';
import {
  UserApprovalConfirmationDialog,
  UserDenialConfirmationDialog,
  UserModerationProfileComponent,
} from './components/modals/moderate-user/user-moderation.component';
// import { MasterGridModule } from 'src/app/shared/modules/master-grid/master-grid.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ClassAdminsTableComponent } from './components/tables/class-admin-table/class-admins-table.component';
import { AwaitingModerationTableComponent } from './components/tables/awaiting-moderation-table/awaiting-moderation-table.component';
import { MemberProfileRendererComponent } from './components/cell-renderers/member-profile/member-profile-renderer.component';
import { UserModerationRendererComponent } from './components/cell-renderers/user-moderation/user-moderation-renderer.component';
import { MemberProfileComponent } from './components/member-profile/member-profile.component';
import { NgxsModule } from '@ngxs/store';
import { MemberState } from './state/member.state';
import { MemberRoutingModule } from './member-routing.module';

const declarations = [
  MembersTableComponent,
  InstitutionAdminsTableComponent,
  ClassAdminsTableComponent,
  AwaitingModerationTableComponent,
  LearnersTableComponent,
  UserModerationProfileComponent,
  UserApprovalConfirmationDialog,
  UserDenialConfirmationDialog,
  MemberProfileRendererComponent,
  UserModerationRendererComponent,
  MemberProfileComponent,
];
const imports = [SharedModule, /*MasterGridModule*/];

@NgModule({
  declarations,
  imports: [
    ...imports,
    MemberRoutingModule,
    NgxsModule.forFeature([MemberState]),
  ],
  exports: [...declarations, ...imports],
})
export class MemberModule {}
