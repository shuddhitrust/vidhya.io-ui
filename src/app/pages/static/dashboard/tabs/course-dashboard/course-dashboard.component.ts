import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { Course } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { FetchCoursesAction } from 'src/app/shared/state/courses/course.actions';
import { CourseState } from 'src/app/shared/state/courses/course.state';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: [
    './course-dashboard.component.scss',
    './../../../../../shared/common/shared-styles.css',
  ],
})
export class CourseDashboardComponent implements OnInit {
  @Select(CourseState.listCourses)
  courses$: Observable<Course[]>;

  @Select(CourseState.isFetching)
  isFetching$: Observable<boolean>;

  constructor(private store: Store, private router: Router) {
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
  }

  ngOnInit(): void {}

  createCourse() {
    this.router.navigateByUrl(uiroutes.COURSE_FORM_ROUTE);
  }

  openCourse(course) {
    this.router.navigate([uiroutes.COURSE_PROFILE_ROUTE], {
      queryParams: { id: course.id },
    });
  }
}
