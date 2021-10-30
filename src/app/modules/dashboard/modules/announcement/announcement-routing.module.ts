import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditAnnouncementComponent } from './components/add-edit-announcement/add-edit-announcement.component';
import { AnnouncementProfileComponent } from './components/announcement-profile/announcement-profile.component';

const routes: Routes = [
  {
    path: uiroutes.ANNOUNCEMENT_FORM_ROUTE.route,
    component: AddEditAnnouncementComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.ANNOUNCEMENT_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.ANNOUNCEMENT_PROFILE_ROUTE.route,
    component: AnnouncementProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.ANNOUNCEMENT_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnouncementRoutingModule {}
