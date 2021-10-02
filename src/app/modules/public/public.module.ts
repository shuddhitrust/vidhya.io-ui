import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SharedModule } from './../../shared/modules/shared.module';
import { PublicUserProfileComponent } from './components/public-user-profile/public-user-profile.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { PublicRoutingModule } from './public-routing.module';
import {
  AuthenticationGuard,
  AuthInterceptor,
  RegistrationFormAuthGuard,
} from 'src/app/shared/api/authentication.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { environment } from 'src/environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
// function that returns `MarkedOptions` with renderer override

const declarations = [
  HomeComponent,
  PasswordResetComponent,
  PrivacyComponent,
  PublicUserProfileComponent,
];

@NgModule({
  declarations,
  exports: [...declarations],
  imports: [
    SharedModule,
    PublicRoutingModule,
    [
      NgxsModule.forRoot([AuthState], {
        developmentMode: !environment.production,
      }),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ],
  ],
  providers: [
    AuthenticationGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: NZ_I18N, useValue: en_US },
    RegistrationFormAuthGuard,
  ],
})
export class PublicModule {}
