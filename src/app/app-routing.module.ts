import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './pages/static/account/account.component';
import { AuthenticationGuard } from './shared/api/authentication.guard';
import { ProfileComponent } from './pages/static/profile/profile.component';
import { uiroutes } from './shared/common/ui-routes';
import { AddEditGroupComponent } from './pages/forms/add-edit-group/add-edit-group.component';
import { GroupProfileComponent } from './pages/profiles/group-profile/group-profile.component';
import { AddEditChapterComponent } from './modules/dashboard/modules/course/components/forms/add-edit-chapter/add-edit-chapter.component';
import { AddEditUserRoleComponent } from './modules/dashboard/modules/admin/modules/user-role/components/forms/add-edit-user-role/add-edit-user-role.component';
import { ChatComponent } from './pages/static/chat/chat.component';
import { AddEditCourseComponent } from './modules/dashboard/modules/course/components/forms/add-edit-course/add-edit-course.component';
import { CourseProfileComponent } from './modules/dashboard/modules/course/components/profiles/course-profile/course-profile.component';
import { ChapterProfileComponent } from './modules/dashboard/modules/course/components/profiles/chapter-profile/chapter-profile.component';

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

  {
    path: uiroutes.GROUP_FORM_ROUTE.route,
    component: AddEditGroupComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.GROUP_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.GROUP_PROFILE_ROUTE.route,
    component: GroupProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.GROUP_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.COURSE_FORM_ROUTE.route,
    component: AddEditCourseComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.COURSE_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.COURSE_PROFILE_ROUTE.route,
    component: CourseProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.COURSE_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.CHAPTER_FORM_ROUTE.route,
    component: AddEditChapterComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.CHAPTER_FORM_ROUTE.auth,
    pathMatch: 'full',
  },
  {
    path: uiroutes.CHAPTER_PROFILE_ROUTE.route,
    component: ChapterProfileComponent,
    canActivate: [AuthenticationGuard],
    data: uiroutes.CHAPTER_PROFILE_ROUTE.auth,
    pathMatch: 'full',
  },
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
