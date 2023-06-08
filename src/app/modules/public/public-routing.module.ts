import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditIssueComponent } from '../dashboard/modules/admin/modules/issues/components/add-edit-issue/add-edit-issue.component';
import { uiroutes } from './../../shared/common/ui-routes';
import { HomeComponent } from './components/pages/home/home.component';
import { ChangePasswordComponent } from './components/pages/change-password/change-password.component'
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';
import { PrivacyComponent } from './components/pages/privacy/privacy.component';
import { TermsConditionsComponent } from './components/pages/terms-conditions/terms-conditions.component';
import { ProjectProfileComponent } from './components/profiles/project-profile/project-profile.component';
import { InstitutionProfileComponent } from './components/profiles/public-institution-profile/public-institution-profile.component';
import { NewsProfileComponent } from './components/profiles/public-news-profile/public-news-profile.component';
import { PublicUserProfileComponent } from './components/profiles/public-user-profile/public-user-profile.component';
/**
 * Public routes
 *  ***NOTE*** - In order for routes to be available without logging in,
 * special provisions need to be made on public.component.html and the corresponding .ts file.
 * Without making these changes the route would not show.
 */
const routes: Routes = [
  {
    path: `${uiroutes.MEMBER_PROFILE_ROUTE.route}/:username`,
    component: PublicUserProfileComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.PROJECT_PROFILE_ROUTE.route,
    component: ProjectProfileComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.ISSUE_FORM_ROUTE.route,
    component: AddEditIssueComponent,
    pathMatch: 'prefix',
  },
  {
    path: `${uiroutes.INSTITUTION_PROFILE_ROUTE.route}/:code`,
    component: InstitutionProfileComponent,
    pathMatch: 'full',
  },
  {
    path: `${uiroutes.NEWS_PROFILE_ROUTE.route}`,
    component: NewsProfileComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.PRIVACY_ROUTE.route,
    component: PrivacyComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.TERMS_CONDITIONS_ROUTE.route,
    component: TermsConditionsComponent,
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
    path: uiroutes.CHANGE_PASSWORD.route,
    component: ChangePasswordComponent,
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
