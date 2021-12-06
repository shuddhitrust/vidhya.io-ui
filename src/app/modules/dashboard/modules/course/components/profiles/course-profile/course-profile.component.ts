import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  Chapter,
  Course,
  CourseSection,
  CourseStatusOptions,
  ExerciseSubmissionStatusOptions,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { ChapterState } from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.state';
import {
  FetchChaptersAction,
  ReorderChaptersAction,
} from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import {
  DragDropComponent,
  DragDropInput,
} from 'src/app/shared/components/drag-drop/drag-drop.component';
import {
  ChapterTitle,
  parseDateTime,
  sortByIndex,
} from 'src/app/shared/common/functions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { COURSES } from 'src/app/modules/dashboard/dashboard.component';
import { CourseState } from '../../../state/courses/course.state';
import { CourseSectionState } from '../../../state/courseSections/courseSection.state';
import {
  DeleteCourseAction,
  GetCourseAction,
  PublishCourseAction,
  ResetCourseFormAction,
} from '../../../state/courses/course.actions';
import {
  FetchCourseSectionsAction,
  ReorderCourseSectionsAction,
} from '../../../state/courseSections/courseSection.actions';
import { emptyCourseSectionFormRecord } from '../../../state/courseSections/courseSection.model';
import { CourseSectionModalComponent } from '../../modals/course-section-modal/course-section-modal.component';
import { CourseInfoModalComponent } from '../../modals/course-info-modal/course-info-modal.component';

@Component({
  selector: 'app-course-profile',
  templateUrl: './course-profile.component.html',
  styleUrls: [
    './course-profile.component.scss',
    './../../../../../../../shared/common/shared-styles.css',
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
  chapters: Chapter[];
  @Select(ChapterState.isFetching)
  isFetchingChapters$: Observable<boolean>;
  isFetchingChapters: boolean;
  @Select(CourseSectionState.listCourseSections)
  courseSections$: Observable<CourseSection[]>;
  courseSections: CourseSection[];
  @Select(ChapterState.isFetching)
  isFetchingCourseSections$: Observable<boolean>;
  isFetchingCourseSections: boolean;
  @Select(CourseState.isFetching)
  isFetchingCourse$: Observable<boolean>;
  courseStatusOptions = CourseStatusOptions;
  courseId = null;
  courseSectionColumnFilters;
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    // this.fetchChapters()
    this.courseSections$.subscribe((val) => {
      this.courseSections = sortByIndex(val);
    });
    this.isFetchingChapters$.subscribe((val) => {
      this.isFetchingChapters = val;
    });
    this.chapters$.subscribe((val) => {
      this.chapters = sortByIndex(val);
    });
    this.course$.subscribe((val) => {
      this.course = val;
    });
  }

  courseIdColumnFilter() {
    return { courseId: this.courseId };
  }

  fetchChapters() {
    this.store.dispatch(
      new FetchChaptersAction({
        searchParams: {
          ...defaultSearchParams,
          pageSize: null,
          columnFilters: this.courseIdColumnFilter(),
        },
      })
    );
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: [this.course?.instructor?.id],
    });
  }
  chapterTitle(chapter) {
    return ChapterTitle(chapter);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.courseId = params['id'];
      if (this.courseId) {
        this.store.dispatch(
          new GetCourseAction({ id: this.courseId, fetchFormDetails: false })
        );
        this.store.dispatch(
          new FetchCourseSectionsAction({
            searchParams: {
              ...defaultSearchParams,
              columnFilters: this.courseIdColumnFilter(),
            },
          })
        );
        this.fetchChapters();
      }
    });
  }

  goBack() {
    this.router.navigate([uiroutes.DASHBOARD_ROUTE.route], {
      queryParams: { tab: COURSES },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  statusIcon(card): { icon: string; iconColor: string; tooltip: string } {
    let icon = null;
    let iconColor = null;
    let tooltip = '';
    switch (card?.completionStatus) {
      case ExerciseSubmissionStatusOptions.pending:
        icon = 'new_releases';
        iconColor = 'var(--orange)';
        tooltip = 'This chapter contains new exercises!';
        break;
      case ExerciseSubmissionStatusOptions.submitted:
        icon = 'done';
        iconColor = 'var(--green)';
        tooltip =
          'You have submitted this chapter. Some exercises in this chapter may be awaiting grading.';
        break;
      case ExerciseSubmissionStatusOptions.graded:
        icon = 'done_all';
        iconColor = 'var(--green)';
        tooltip = 'This chapter is fully graded!';
        break;
      case ExerciseSubmissionStatusOptions.returned:
        icon = 'cancel';
        iconColor = 'var(--red)';
        tooltip =
          'Some exercises in this chapter have been returned. Please follow the remarks and resubmit this chapter.';
        break;
      default:
        break;
    }
    return { icon, iconColor, tooltip };
  }

  editCourse() {
    this.router.navigate([uiroutes.COURSE_FORM_ROUTE.route], {
      queryParams: { id: this.course.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the course named "${this.course.title}"?`,
      additionalDetails:
        'Note that this will delete any chapters within this course and the exercises and submissions within those chapters!',
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteCourse();
      }
    });
  }
  deleteCourse() {
    this.store.dispatch(new DeleteCourseAction({ id: this.course.id }));
  }

  reorderSections() {
    const sectionsList: DragDropInput[] = this.courseSections.map((c) => {
      return { id: c.id, label: c.title };
    });

    const dialogRef = this.dialog.open(DragDropComponent, {
      data: sectionsList,
    });

    dialogRef.afterClosed().subscribe((newIndexArray) => {
      for (let i = 0; i < newIndexArray.length; i++) {
        let id = newIndexArray[i];
        let section = this.courseSections.find((c) => c.id == id);
        section = Object.assign({}, { ...section, index: i + 1 });
        this.courseSections = this.courseSections.map((s) => {
          return s.id == id ? section : s;
        });
      }

      const indexList = this.courseSections.map((c) => {
        return { id: c.id, index: c.index };
      });
      this.store.dispatch(new ReorderCourseSectionsAction({ indexList }));
    });
  }
  reorderChapters(section = null) {
    let newChapters = Object.assign([], this.chapters);
    if (section) {
      newChapters = newChapters.filter((c) => {
        return c.section?.id == section.id;
      });
    }
    const chaptersList: DragDropInput[] = newChapters.map((c) => {
      return { id: c.id, label: c.title };
    });

    const dialogRef = this.dialog.open(DragDropComponent, {
      data: chaptersList,
    });

    dialogRef.afterClosed().subscribe((newIndexArray) => {
      for (let i = 0; i < newIndexArray.length; i++) {
        const id = newIndexArray[i];
        let chapter = this.chapters.find((c) => c.id == id);
        chapter = Object.assign({}, { ...chapter, index: i + 1 });
        this.chapters = this.chapters.map((c) => {
          return c.id == id ? chapter : c;
        });
      }
      const indexList = this.chapters.map((c) => {
        return { id: c.id, index: c.index };
      });
      this.store.dispatch(new ReorderChaptersAction({ indexList }));
    });
  }
  parseDate(date) {
    return parseDateTime(date);
  }

  createChapter() {
    // this.store.dispatch(
    //   new SetCourseInChapterForm({ courseId: this.course?.id })
    // );
    this.router.navigate([uiroutes.CHAPTER_FORM_ROUTE.route], {
      queryParams: { courseId: this.course.id },
    });
  }
  createEditSection(courseSection = emptyCourseSectionFormRecord) {
    const dialogRef = this.dialog.open(CourseSectionModalComponent, {
      data: {
        course: this.course,
        courseSection: courseSection,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  sectionChapters(section = { id: null }) {
    return this.chapters.filter((c) => {
      return c.section?.id == section.id;
    });
  }

  chapterPrerequisites(chapter) {
    let prerequisites = '';
    chapter?.prerequisites?.forEach((c) => {
      if (prerequisites.length) {
        prerequisites += ', "' + c.title + '"';
      } else {
        prerequisites += c.title;
      }
    });
    return `To open this chapter, you must have completed ${prerequisites}`;
  }

  openCourseInfo() {
    const dialogRef = this.dialog.open(CourseInfoModalComponent, {
      data: {
        course: this.course,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  openChapter(chapter) {
    if (!chapter.locked) {
      this.router.navigate([uiroutes.CHAPTER_PROFILE_ROUTE.route], {
        queryParams: { id: chapter.id, courseId: this.course.id },
      });
    } else {
      this.store.dispatch(
        new ShowNotificationAction({
          message: 'This chapter is locked for your at the moment',
          action: 'error',
        })
      );
    }
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
