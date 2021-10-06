import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './../../shared/api/authentication.guard';
import { uiroutes } from './../../shared/common/ui-routes';
import { ErrorPageComponent } from './components/error/error.component';
import { HomeComponent } from './components/home/home.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { PublicUserProfileComponent } from './components/public-user-profile/public-user-profile.component';

// import { InstitutionProfileComponent } from './pages/modals/institution-profile/institution-profile.component';

/**
 * Public routes
 *  ***NOTE*** - In order for routes to be available without logging in,
 * special provisions need to be made on app.component.html and the corresponding .ts file.
 * Without making these changes the route would not show.
 */
const routes: Routes = [
  {
    path: `${uiroutes.MEMBER_PROFILE_ROUTE.route}/:username`,
    component: PublicUserProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.MEMBER_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.PRIVACY_ROUTE.route,
    component: PrivacyComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.PRIVACY_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: `${uiroutes.ACTIVATE_ACCOUNT_ROUTE.route}/:token`,
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: `${uiroutes.PASSWORD_RESET_ROUTE.route}/:token`,
    component: PasswordResetComponent,
    pathMatch: 'full',
  },
  {
    path: `${uiroutes.REGISTER_ROUTE.route}`,
    component: HomeComponent,
    pathMatch: 'full',
  },
  { path: '', component: HomeComponent },
  // End of public routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
