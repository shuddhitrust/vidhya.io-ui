import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { OwnProfileComponent } from './components/own-user-profile/own-profile.component';

const routes: Routes = [
  {
    path: uiroutes.OWN_PROFILE_ROUTE.route,
    component: OwnProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.OWN_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
