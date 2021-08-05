import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteCourseAction,
  GetCourseAction,
  PublishCourseAction,
  ResetCourseFormAction,
} from 'src/app/shared/state/courses/course.actions';
import { CourseState } from 'src/app/shared/state/courses/course.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  Chapter,
  Course,
  CourseStatusOptions,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import {
  FetchChaptersAction,
  FetchNextChaptersAction,
  SetCourseInChapterForm,
} from 'src/app/shared/state/chapters/chapter.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';

@Component({
  selector: 'app-course-profile',
  templateUrl: './course-profile.component.html',
  styleUrls: [
    './course-profile.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class CourseProfileComponent implements OnInit, OnDestroy {
  resource = resources.COURSE;
  resourceActions = RESOURCE_ACTIONS;
  @Select(CourseState.getCourseFormRecord)
  course$: Observable<Course>;
  course: Course;
  @Select(ChapterState.listChapters)
  chapters$: Observable<Chapter[]>;
  @Select(ChapterState.isFetching)
  isFetchingChapters$: Observable<boolean>;
  isFetchingChapters: boolean;
  @Select(CourseState.isFetching)
  isFetchingCourse$: Observable<boolean>;
  courseStatusOptions = CourseStatusOptions;
  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    // this.fetchChapters()
    this.isFetchingChapters$.subscribe((val) => {
      this.isFetchingChapters = val;
    });
    this.course$.subscribe((val) => {
      this.course = val;
      this.fetchChapters();
    });
  }

  chapterFilters() {
    return { courseId: this.course?.id };
  }

  fetchChapters() {
    this.store.dispatch(
      new FetchChaptersAction({
        searchParams: {
          ...defaultSearchParams,
          newColumnFilters: this.chapterFilters(),
        },
      })
    );
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.course?.instructor?.id],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const courseId = params['id'];
      this.store.dispatch(new GetCourseAction({ id: courseId }));
    });
  }

  goBack() {
    this.location.back();
  }

  editCourse() {
    this.router.navigate([uiroutes.COURSE_FORM_ROUTE.route], {
      queryParams: { id: this.course.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const dialogRef = this.dialog.open(CourseDeleteConfirmationDialog, {
      data: this.course,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for announcment => ', result);
      if (result == true) {
        this.deleteCourse();
      }
    });
  }
  deleteCourse() {
    console.log('payload before passing to action => ', {
      id: this.course.id,
    });
    this.store.dispatch(new DeleteCourseAction({ id: this.course.id }));
  }

  onScroll() {
    console.log('scrolling groups');
    if (!this.isFetchingChapters) {
      this.store.dispatch(new FetchNextChaptersAction());
    }
  }
  createChapter() {
    this.store.dispatch(
      new SetCourseInChapterForm({ courseId: this.course?.id })
    );
    this.router.navigateByUrl(uiroutes.CHAPTER_FORM_ROUTE.route);
  }

  openChapter(chapter) {
    this.router.navigate([uiroutes.CHAPTER_PROFILE_ROUTE.route], {
      queryParams: { id: chapter.id },
    });
  }

  publishCourse() {
    this.store.dispatch(
      new PublishCourseAction({ id: this.course.id, publishChapters: true })
    );
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetCourseFormAction());
  }
}

@Component({
  selector: 'course-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.html',
})
export class CourseDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<CourseDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Course
  ) {}
}
