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
  GetChapterAction,
} from 'src/app/shared/state/chapters/chapter.actions';
import { ChapterState } from 'src/app/shared/state/chapters/chapter.state';
import { Observable } from 'rxjs';
import { emptyChapterFormRecord } from 'src/app/shared/state/chapters/chapter.model';
import {
  Chapter,
  ChapterStatusOptions,
  Course,
  MatSelectOption,
} from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { FetchCoursesAction } from 'src/app/shared/state/courses/course.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { CourseState } from 'src/app/shared/state/courses/course.state';
@Component({
  selector: 'app-add-edit-chapter',
  templateUrl: './add-edit-chapter.component.html',
  styleUrls: [
    './add-edit-chapter.component.scss',
    './../../../shared/common/shared-styles.css',
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

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.store.dispatch(
      new FetchCoursesAction({ searchParams: defaultSearchParams })
    );
    this.chapterForm = this.setupChapterFormGroup();
    this.courseOptions$.subscribe((val) =>
      console.log('ChapterFormRecord course options = >', val)
    );
    this.chapterFormRecord$.subscribe((val) => {
      this.chapterFormRecord = val;
      console.log('ChapterFormRecord => ', val);
      this.chapterForm = this.setupChapterFormGroup(this.chapterFormRecord);
    });

    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
  }

  setupChapterFormGroup = (
    chapterFormRecord: Chapter = emptyChapterFormRecord
  ): FormGroup => {
    console.log('the current User id ', this.currentUserId);
    this.instructions = chapterFormRecord.instructions;
    return this.fb.group({
      id: [chapterFormRecord?.id],
      title: [chapterFormRecord?.title, Validators.required],
      index: [chapterFormRecord?.index],
      instructions: [chapterFormRecord?.instructions, Validators.required],
      course: [chapterFormRecord?.course?.id, Validators.required],
      prerequisites: [
        chapterFormRecord.prerequisites?.length
          ? chapterFormRecord.prerequisites?.map((i) => i.id)
          : [],
      ],
      dueDate: [chapterFormRecord?.dueDate],
      points: [chapterFormRecord?.points],
      status: [chapterFormRecord?.status],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetChapterAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    form.get('instructions').setValue(this.instructions);
    console.log('chapter submit form value => ', {
      form: form.value,
      instructions: this.instructions,
    });
    this.store.dispatch(
      new CreateUpdateChapterAction({
        form,
        formDirective,
      })
    );
  }
}
