import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  Course,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  FetchCoursesAction,
  FetchNextCoursesAction,
} from '../../state/courses/course.actions';
import { CourseState } from '../../state/courses/course.state';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: [
    './course-dashboard.component.scss',
    './../../../../../../shared/common/shared-styles.css',
  ],
})
export class CourseDashboardComponent implements OnInit, OnDestroy {
  resource: string = resources.COURSE;
  resourceActions = RESOURCE_ACTIONS;

  @Select(CourseState.listCourses)
  courses$: Observable<Course[]>;

  @Select(CourseState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
    this.isFetching$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetching = val;
    });
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action);
  }

  ngOnInit(): void {}
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  onScroll() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextCoursesAction());
    }
  }
  createCourse() {
    this.router.navigateByUrl(uiroutes.COURSE_FORM_ROUTE.route);
  }
  coursePrerequisites(course: Course) {
    let prerequisites = '';
    course?.mandatoryPrerequisites?.forEach((c) => {
      if (prerequisites.length) {
        prerequisites += ', "' + c.title + '"';
      } else {
        prerequisites += c.title;
      }
    });
    return `To participate in this course, you must have completed ${prerequisites}`;
  }

  openCourse(course) {
    if (!course.locked) {
      this.router.navigate([uiroutes.COURSE_PROFILE_ROUTE.route], {
        queryParams: { id: course.id },
      });
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'This course is locked for your at the moment',
          action: 'error',
        })
      );
    }
  }
}
