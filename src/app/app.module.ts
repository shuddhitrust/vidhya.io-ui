import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {
  GraphQLModule,
  // TokenUpdater,
} from './shared/api/graphql/graphql.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  AuthenticationGuard,
  AuthInterceptor,
  RegistrationFormAuthGuard,
} from './shared/api/authentication.guard';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FormBuilder } from '@angular/forms';

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
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AppLoadingOverlayComponent } from './shared/components/loading/loading.component';
import { SharedModule } from './shared/modules/shared.module';
import { PublicModule } from './modules/public/public.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { AuthModule } from './modules/auth/auth.module';
// function that returns `MarkedOptions` with renderer override

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DragDropComponent,
    AppLoadingOverlayComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    AuthModule,
    PublicModule,
    DashboardModule,
    AppRoutingModule,
    GraphQLModule,
    // TokenUpdater,
    ScullyLibModule,
    [
      NgxsModule.forRoot([], {
        developmentMode: !environment.production,
      }),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ],
  ],
  providers: [
    FormBuilder,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: NZ_I18N, useValue: en_US },
    AuthenticationGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    RegistrationFormAuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
