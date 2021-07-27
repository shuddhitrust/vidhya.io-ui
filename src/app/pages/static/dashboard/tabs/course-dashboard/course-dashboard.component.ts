import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  Course,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchCoursesAction,
  FetchNextCoursesAction,
} from 'src/app/shared/state/courses/course.actions';
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
  resource: string = resources.COURSE;
  resourceActions = RESOURCE_ACTIONS;

  @Select(CourseState.listCourses)
  courses$: Observable<Course[]>;

  @Select(CourseState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnInit(): void {}
  onScroll() {
    console.log('scrolling groups');
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextCoursesAction());
    }
  }
  createCourse() {
    this.router.navigateByUrl(uiroutes.COURSE_FORM_ROUTE.route);
  }

  openCourse(course) {
    this.router.navigate([uiroutes.COURSE_PROFILE_ROUTE.route], {
      queryParams: { id: course.id },
    });
  }
}
