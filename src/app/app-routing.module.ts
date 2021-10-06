import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './shared/api/authentication.guard';
import { uiroutes } from './shared/common/ui-routes';
import { ErrorPageComponent } from './modules/public/components/error/error.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
