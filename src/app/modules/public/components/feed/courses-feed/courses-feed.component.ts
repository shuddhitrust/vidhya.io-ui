import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { CourseState } from 'src/app/modules/dashboard/modules/course/state/courses/course.state';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  Course,
  PublicCourse,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  FetchNextPublicCoursesAction,
  FetchPublicCoursesAction,
} from '../../../state/public/public.actions';
import { PublicState } from '../../../state/public/public.state';
import { CourseDisplayComponent } from './course-dialog/course-display.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-courses-feed',
  templateUrl: './courses-feed.component.html',
  styleUrls: ['./courses-feed.component.scss'],
})
export class CoursesFeedComponent implements OnInit, OnDestroy {
  @Input()
  currentQuery: string = null;
  @Select(PublicState.listPublicCourses)
  courses$: Observable<PublicCourse[]>;

  @Select(CourseState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();


  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.store.dispatch(
      new FetchPublicCoursesAction({
        searchParams: {
          ...defaultSearchParams,
          searchQuery: this.currentQuery,
        },
      })
    );
    this.isFetching$
    .pipe(takeUntil(this.destroy$))
    .subscribe((val) => {
      this.isFetching = val;
    });
  }

  ngOnInit(): void {}

  onScroll() {
    if (!this.isFetching) {
      this.store.dispatch(new FetchNextPublicCoursesAction());
    }
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
    const dialogRef = this.dialog.open(CourseDisplayComponent, {
      data: {
        courseId: course.id,
      },
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
