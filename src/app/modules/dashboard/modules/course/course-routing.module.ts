import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from 'src/app/shared/api/authentication.guard';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { AddEditChapterComponent } from './components/forms/add-edit-chapter/add-edit-chapter.component';
import { AddEditCourseComponent } from './components/forms/add-edit-course/add-edit-course.component';
import { ChapterProfileComponent } from './components/profiles/chapter-profile/chapter-profile.component';
import { CourseProfileComponent } from './components/profiles/course-profile/course-profile.component';

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseRoutingModule {}
