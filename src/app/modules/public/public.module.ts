import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SharedModule } from './../../shared/modules/shared.module';
import { PublicUserProfileComponent } from './components/public-user-profile/public-user-profile.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { PublicRoutingModule } from './public-routing.module';
import { environment } from 'src/environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { PublicState } from './state/public/public.state';
import { PublicComponent } from './components/public/public.component';
import { AuthModule } from '../auth/auth.module';
// function that returns `MarkedOptions` with renderer override

const declarations = [
  HomeComponent,
  PasswordResetComponent,
  PrivacyComponent,
  PublicUserProfileComponent,
  PublicComponent,
];

@NgModule({
  declarations,
  exports: [...declarations],
  imports: [
    SharedModule,
    AuthModule,
    PublicRoutingModule,
    NgxsModule.forFeature([PublicState]),
  ],
})
export class PublicModule {}
