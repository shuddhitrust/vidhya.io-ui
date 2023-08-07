import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AddEditMemberComponent } from './components/add-edit-member/add-edit-member.component';
import { AuthState } from './state/auth.state';
import { SpecialCharacterDirective } from 'src/app/shared/directives/SpecialCharacterDirective.directive';
import { OnlyNumberDirective } from 'src/app/shared/directives/OnlyNumberDirective.directive';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MemberShipStatusComponent } from './components/member-ship-status/member-ship-status.component';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safeHTMLPipe.pipe';

const declarations = [AddEditMemberComponent,SpecialCharacterDirective,OnlyNumberDirective,MemberShipStatusComponent, SafeHtmlPipe];
const imports = [SharedModule, AuthRoutingModule, MatExpansionModule,MatTooltipModule];

@NgModule({
  declarations,
  imports: [...imports, NgxsModule.forFeature([AuthState])],
  exports: [...declarations, ...imports],
})
export class AuthModule {}
