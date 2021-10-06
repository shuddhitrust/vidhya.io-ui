import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';

import {
  CreateUpdateChapterAction,
  FetchChaptersAction,
  GetChapterAction,
} from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.actions';
import { ChapterState } from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.state';
import { Observable } from 'rxjs';
import { emptyChapterFormRecord } from 'src/app/modules/dashboard/modules/course/state/chapters/chapter.model';
import {
  Chapter,
  ChapterStatusOptions,
  MatSelectOption,
} from 'src/app/shared/common/models';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { CourseState } from '../../../state/courses/course.state';
import { CourseSectionState } from '../../../state/courseSections/courseSection.state';
import { FetchCoursesAction } from '../../../state/courses/course.actions';
import { FetchCourseSectionsAction } from '../../../state/courseSections/courseSection.actions';

@Component({
  selector: 'app-add-edit-chapter',
  templateUrl: './add-edit-chapter.component.html',
  styleUrls: [
    './add-edit-chapter.component.scss',
    './../../../../../../../shared/common/shared-styles.css',
  ],
})
export class AddEditChapterComponent implements OnInit {
  formSubmitting: boolean = false;
  chapterStatusOptions = ChapterStatusOptions;
  currentDate = new Date();
  params: object = {};
  @Select(ChapterState.getChapterFormRecord)
  chapterFormRecord$: Observable<Chapter>;
  @Select(GroupState.listGroupOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  @Select(ChapterState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  chapterFormRecord: Chapter = emptyChapterFormRecord;
  chapterForm: FormGroup;
  instructions;
  @Select(CourseState.listCourseOptions)
  courseOptions$: Observable<MatSelectOption[]>;
  @Select(ChapterState.listChapterOptions)
  chapterOptions$: Observable<MatSelectOption[]>;
  @Select(CourseSectionState.listCourseSectionOptions)
  courseSectionOptions$: Observable<MatSelectOption[]>;
  courseId = null;
  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.ngOnInit();
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
    this.courseOptions$.subscribe((val) => {
      if (this.courseId) {
        this.chapterForm.get('course').setValue(this.courseId);
      }
    });
    this.chapterFormRecord$.subscribe((val) => {
      this.chapterFormRecord = val;
      this.chapterForm = this.setupChapterFormGroup(this.chapterFormRecord);
    });
  }

  setupChapterFormGroup = (
    chapterFormRecord: Chapter = emptyChapterFormRecord
  ): FormGroup => {
    this.instructions = chapterFormRecord.instructions;
    return this.fb.group({
      id: [chapterFormRecord?.id],
      title: [chapterFormRecord?.title, Validators.required],
      index: [chapterFormRecord?.index],
      instructions: [chapterFormRecord?.instructions, Validators.required],
      course: [
        chapterFormRecord?.course?.id
          ? chapterFormRecord?.course.id
          : this.courseId,
        Validators.required,
      ],
      section: [chapterFormRecord?.section?.id],
      prerequisites: [
        chapterFormRecord.prerequisites?.length
          ? chapterFormRecord.prerequisites?.map((i) => i.id)
          : [],
      ],
      dueDate: [chapterFormRecord?.dueDate],
      // points: [chapterFormRecord?.points],
      status: [chapterFormRecord?.status],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      this.courseId = params['courseId'];
      if (id) {
        this.store.dispatch(new GetChapterAction({ id }));
      }
      if (this.courseId) {
        this.store.dispatch(
          new FetchChaptersAction({
            searchParams: {
              ...defaultSearchParams,
              pageSize: null,
              columnFilters: { courseId: this.courseId },
            },
          })
        );
        this.store.dispatch(
          new FetchCourseSectionsAction({
            searchParams: {
              ...defaultSearchParams,
              columnFilters: { courseId: this.courseId },
            },
          })
        );
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    form.get('instructions').setValue(this.instructions);
    this.store.dispatch(
      new CreateUpdateChapterAction({
        form,
        formDirective,
      })
    );
  }
}
