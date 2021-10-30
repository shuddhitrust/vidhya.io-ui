import { NgModule } from '@angular/core';
import { InstitutionModule } from './modules/institution/institution.module';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { MemberModule } from './modules/member/member.module';
import { UserRoleModule } from './modules/user-role/user-role.module';

const declarations = [AdminDashboardComponent];
const imports = [SharedModule, InstitutionModule, MemberModule, UserRoleModule];

@NgModule({
  declarations,
  imports,
  exports: [...declarations, ...imports],
})
export class AdminModule {}
