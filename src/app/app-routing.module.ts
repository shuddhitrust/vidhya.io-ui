import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './shared/api/authentication.guard';
import { uiroutes } from './shared/common/ui-routes';
import { ErrorPageComponent } from './modules/public/components/pages/error/error.component';

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
  },
  {
    path: uiroutes.ERROR_ROUTE.route,
    pathMatch: 'full',
    component: ErrorPageComponent,
  },
  { path: '**', pathMatch: 'full', redirectTo: uiroutes.ERROR_ROUTE.route },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
