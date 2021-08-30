import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteCourseAction,
  FetchCoursesAction,
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
  CourseSection,
  CourseStatusOptions,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import {
  FetchChaptersAction,
  FetchNextChaptersAction,
  ReorderChaptersAction,
  SetCourseInChapterForm,
} from 'src/app/shared/state/chapters/chapter.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { DragDropComponent } from 'src/app/shared/components/drag-drop/drag-drop.component';
import { parseDateTime, sortByIndex } from 'src/app/shared/common/functions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { CourseSectionModalComponent } from '../../modals/course-section-modal/course-section-modal.component';
import { emptyCourseSectionFormRecord } from 'src/app/shared/state/courseSections/courseSection.model';
import { CourseSectionState } from 'src/app/shared/state/courseSections/courseSection.state';
import {
  FetchCourseSectionsAction,
  ReorderCourseSectionsAction,
} from 'src/app/shared/state/courseSections/courseSection.actions';

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

  constructor(
    public dialog: MatDialog,
    private location: Location,
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

  chapterFilters() {
    return { courseId: this.courseId };
  }

  fetchChapters() {
    this.store.dispatch(
      new FetchChaptersAction({
        searchParams: {
          ...defaultSearchParams,
          columnFilters: this.chapterFilters(),
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
      this.courseId = params['id'];
      if (this.courseId) {
        this.store.dispatch(new GetCourseAction({ id: this.courseId }));
        this.store.dispatch(
          new FetchCourseSectionsAction({ courseId: this.courseId })
        );
        this.fetchChapters();
      }
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
    console.log('scrolling course');
    if (!this.isFetchingChapters) {
      this.store.dispatch(new FetchNextChaptersAction());
    }
  }
  reorderSections() {
    const sectionsList = this.courseSections.map((c) => {
      return { index: c.id, label: c.title };
    });
    console.log('initial index list ', { sectionsList });
    const dialogRef = this.dialog.open(DragDropComponent, {
      data: sectionsList,
    });

    dialogRef.afterClosed().subscribe((newIndexArray) => {
      console.log('after reordering', { newIndexArray });
      let i = 1;
      const reorderedList = newIndexArray.map((index) => {
        let section = this.courseSections.find((c) => c.id == index);
        section = { ...section, index: i };
        i++;
        return section;
      });
      console.log('old order of sections ', { sections: this.courseSections });
      this.courseSections = Object.assign([], reorderedList);
      console.log('new order of sections ', { sections: this.courseSections });
      const indexList = this.courseSections.map((c) => {
        return { id: c.id, index: c.index };
      });
      this.store.dispatch(new ReorderCourseSectionsAction({ indexList }));
    });
  }
  reorderChapters(section = null) {
    let chapters = this.chapters;
    if (section) {
      chapters = chapters.filter((c) => {
        return c.section?.id == section.id;
      });
    }
    const chaptersList = this.chapters.map((c) => {
      return { index: c.id, label: c.title };
    });
    console.log('initial index list ', { chaptersList });
    const dialogRef = this.dialog.open(DragDropComponent, {
      data: chaptersList,
    });

    dialogRef.afterClosed().subscribe((newIndexArray) => {
      console.log('after reordering', { newIndexArray });
      let i = 1;
      const reorderedList = newIndexArray.map((index) => {
        let chapter = this.chapters.find((c) => c.id == index);
        chapter = { ...chapter, index: i };
        i++;
        return chapter;
      });
      console.log('old order of chapters ', { chapters: this.chapters });
      this.chapters = Object.assign([], reorderedList);
      console.log('new order of chapters ', { chapters: this.chapters });
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

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for create course section => ', result);
    });
  }

  sectionChapters(section = { id: null }) {
    return this.chapters.filter((c) => {
      return c.section?.id == section.id;
    });
  }
  chapterTitle(chapter) {
    return `${chapter.section?.index ? chapter.section?.index + '.' : ''}${
      chapter.index ? chapter.index : ''
    } ${chapter.title}`;
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

  openChapter(chapter) {
    if (!chapter.locked) {
      this.router.navigate([uiroutes.CHAPTER_PROFILE_ROUTE.route], {
        queryParams: { id: chapter.id, courseId: this.course.id },
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
