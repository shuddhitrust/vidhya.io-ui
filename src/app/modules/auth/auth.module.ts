import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AddEditMemberComponent } from './components/add-edit-member/add-edit-member.component';
import { OwnProfileComponent } from './components/own-user-profile/own-profile.component';

const declarations = [OwnProfileComponent, AddEditMemberComponent];
const imports = [SharedModule];

@NgModule({
  declarations,
  imports,
  exports: [...declarations, ...imports],
})
export class AuthModule {}
