import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './pages/static/account/account.component';
import { AuthenticationGuard } from './shared/api/authentication.guard';
import { ProfileComponent } from './pages/static/profile/profile.component';
import { uiroutes } from './shared/common/ui-routes';
// import { InstitutionProfileComponent } from './pages/modals/institution-profile/institution-profile.component';

const routes: Routes = [
  {
    path: uiroutes.DASHBOARD_ROUTE.route,
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [AuthenticationGuard],
    data: uiroutes.DASHBOARD_ROUTE.auth,
  },
  {
    path: '',
    loadChildren: () =>
      import('./modules/public/public.module').then((m) => m.PublicModule),
    canActivate: [AuthenticationGuard],
    data: null,
  },
  {
    path: uiroutes.PROFILE_ROUTE.route,
    component: ProfileComponent,
    pathMatch: 'full',
  },
  {
    path: uiroutes.ACCOUNT_ROUTE.route,
    component: AccountComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.ACCOUNT_ROUTE.auth,
    pathMatch: 'full',
  },

  // {
  //   path: uiroutes.SUPPORT_ROUTE.route,
  //   component: SupportComponent,
  //   canActivate: [AuthenticationGuard],
  //   data: uiroutes.SUPPORT_ROUTE.auth,
  //   pathMatch: 'full',
  // },
  // {
  //   path: uiroutes.CHAT_ROUTE.route,
  //   component: ChatComponent,
  //   canActivate: [AuthenticationGuard],
  //   data: uiroutes.CHAT_ROUTE.auth,
  //   pathMatch: 'full',
  // },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
