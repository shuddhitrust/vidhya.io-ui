import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SharedModule } from './../../shared/modules/shared.module';
import { PublicUserProfileComponent } from './components/public-user-profile/public-user-profile.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { PublicRoutingModule } from './public-routing.module';
import { NgxsModule } from '@ngxs/store';
import { PublicState } from './state/public/public.state';
import { PublicComponent } from './components/public/public.component';
import { MemberModule } from '../dashboard/modules/admin/modules/member/member.module';
import { AuthModule } from '../auth/auth.module';
import { ErrorPageComponent } from './components/error/error.component';
import { PublicTabsComponent } from './components/public-lists/public-lists.component';
import { LearnersListComponent } from './components/public-lists/learners-list/learners-list.component';
import { PublicInstitutionsTabComponent } from './components/public-lists/institutions-list/institutions-list.component';
import { InstitutionModule } from '../dashboard/modules/admin/modules/institution/institution.module';
import { InstitutionProfileComponent } from './components/public-institution-profile/public-institution-profile.component';

const declarations = [
  HomeComponent,
  PasswordResetComponent,
  PrivacyComponent,
  PublicUserProfileComponent,
  PublicComponent,
  ErrorPageComponent,
  PublicTabsComponent,
  LearnersListComponent,
  PublicInstitutionsTabComponent,
  InstitutionProfileComponent,
];

@NgModule({
  declarations,
  exports: [...declarations],
  imports: [
    SharedModule,
    AuthModule,
    MemberModule,
    InstitutionModule,
    PublicRoutingModule,
    NgxsModule.forFeature([PublicState]),
  ],
})
export class PublicModule {}
