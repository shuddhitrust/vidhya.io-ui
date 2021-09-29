import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  GraphQLModule,
  // TokenUpdater,
} from './shared/api/graphql/graphql.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Styling } from './styling.imports';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './pages/static/home/home.component';
import { ProfileComponent } from './pages/static/profile/profile.component';
import { AccountComponent } from './pages/static/account/account.component';
import { SupportComponent } from './pages/static/support/support.component';
import {
  AuthenticationGuard,
  AuthInterceptor,
  RegistrationFormAuthGuard,
} from './shared/api/authentication.guard';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
/** Date picker date format */

// const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

/** config angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);

/** config ng-zorro-antd i18n **/
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';

import { PasswordResetComponent } from './pages/forms/password-reset/password-reset.component';
import { PrivacyComponent } from './pages/static/privacy/privacy.component';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { ScullyLibModule } from '@scullyio/ng-lib';
import { DragDropComponent } from './shared/components/drag-drop/drag-drop.component';
import { DashboardModule } from './pages/static/dashboard/dashboard.module';
import { AddEditMemberComponent } from './pages/forms/add-edit-member/add-edit-member.component';
import { AppLoadingOverlayComponent } from './shared/components/loading/loading.component';
import { PublicUserProfileComponent } from './pages/profiles/public-user-profile/public-user-profile.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// function that returns `MarkedOptions` with renderer override

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    ProfileComponent,
    AccountComponent,
    SupportComponent,
    PasswordResetComponent,
    PrivacyComponent,
    DragDropComponent,
    AddEditMemberComponent,
    AppLoadingOverlayComponent,
    PublicUserProfileComponent,
  ],
  // exports: [SimpleLoadingSpinnerComponent],
  imports: [
    DashboardModule,
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    Styling,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    // TokenUpdater,
    ScullyLibModule,
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
    FormBuilder,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
