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
  CreateUpdateCourseAction,
  FetchCoursesAction,
  GetCourseAction,
} from 'src/app/shared/state/courses/course.actions';
import { CourseState } from 'src/app/shared/state/courses/course.state';
import { Observable } from 'rxjs';
import { emptyCourseFormRecord } from 'src/app/shared/state/courses/course.model';
import { Course, MatSelectOption } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import { FetchInstitutionsAction } from 'src/app/shared/state/institutions/institution.actions';
import { dateFormat, defaultSearchParams } from 'src/app/shared/common/constants';
import * as moment from 'moment';
@Component({
  selector: 'app-add-edit-course',
  templateUrl: './add-edit-course.component.html',
  styleUrls: [
    './add-edit-course.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditCourseComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  currentDate = new Date();
  @Select(CourseState.getCourseFormRecord)
  courseFormRecord$: Observable<Course>;
  @Select(InstitutionState.listInstitutionOptions)
  institutionOptions$: Observable<MatSelectOption[]>;
  @Select(CourseState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(CourseState.listCourseOptions)
  courseOptions$: Observable<MatSelectOption[]>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  courseFormRecord: Course = emptyCourseFormRecord;
  courseForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.store.dispatch(
      new FetchInstitutionsAction({ searchParams: defaultSearchParams })
    );
    this.store.dispatch(
      new FetchCoursesAction({searchParams: defaultSearchParams})
    );
    this.currentUserId$.subscribe(val => {
      console.log('from current user id in constructor => ', val)
      this.currentUserId = val;
    });
    this.courseFormRecord$.subscribe((val) => {
      this.courseFormRecord = val;
      this.courseForm = this.setupCourseFormGroup(this.courseFormRecord);
    });
    
    this.courseForm = this.setupCourseFormGroup();
  }

  setupCourseFormGroup = (
    courseFormRecord: Course = emptyCourseFormRecord
  ): FormGroup => {
    console.log('the current User id ', this.currentUserId);
    return this.fb.group({
      id: [courseFormRecord?.id],
      instructor: [
        courseFormRecord?.instructor?.id
          ? courseFormRecord?.instructor?.id
          : this.currentUserId,
        Validators.required,
      ],
      title: [courseFormRecord?.title, Validators.required],
      blurb: [courseFormRecord?.blurb, Validators.required],
      description: [courseFormRecord?.description, Validators.required],
      institutions: [
        courseFormRecord.institutions?.map((i) => i.id)
          ? courseFormRecord.institutions?.map((i) => i.id)
          : [],

      ],
      mandatoryPrerequisites: [
        courseFormRecord.mandatoryPrerequisites?.map((i) => i.id)
          ? courseFormRecord.mandatoryPrerequisites?.map((i) => i.id)
          : []
      ],
      recommendedPrerequisites: [
        courseFormRecord.recommendedPrerequisites?.map((i) => i.id)
          ? courseFormRecord.recommendedPrerequisites?.map((i) => i.id)
          : []
      ],
      startDate: [courseFormRecord?.startDate],
      endDate: [courseFormRecord?.endDate],
      creditHours: [courseFormRecord?.creditHours],
    });
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetCourseAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new CreateUpdateCourseAction({
        form,
        formDirective,
      })
    );
  }
}
