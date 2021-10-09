import { NgModule } from '@angular/core';
import { SharedModule } from './../../shared/modules/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { NgxsModule } from '@ngxs/store';
import { PublicState } from './state/public/public.state';
import { PublicComponent } from './components/public/public.component';
import { MemberModule } from '../dashboard/modules/admin/modules/member/member.module';
import { AuthModule } from '../auth/auth.module';
import { ErrorPageComponent } from './components/pages/error/error.component';
import { PublicTabsComponent } from './components/feed/public-lists.component';
import { PublicLearnersFeedComponent } from './components/feed/learners-feed/learners-feed.component';
import { InstitutionModule } from '../dashboard/modules/admin/modules/institution/institution.module';
import { InstitutionProfileComponent } from './components/profiles/public-institution-profile/public-institution-profile.component';
import { InstitutionsFeedComponent } from './components/feed/institutions-feed/institutions-feed.component';
import { HomeComponent } from './components/pages/home/home.component';
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';
import { PrivacyComponent } from './components/pages/privacy/privacy.component';
import { PublicUserProfileComponent } from './components/profiles/public-user-profile/public-user-profile.component';

const declarations = [
  HomeComponent,
  PasswordResetComponent,
  PrivacyComponent,
  PublicUserProfileComponent,
  PublicComponent,
  ErrorPageComponent,
  PublicTabsComponent,
  PublicLearnersFeedComponent,
  InstitutionsFeedComponent,
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
