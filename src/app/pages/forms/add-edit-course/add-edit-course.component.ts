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
  GetCourseAction,
} from 'src/app/shared/state/courses/course.actions';
import { CourseState } from 'src/app/shared/state/courses/course.state';
import { Observable } from 'rxjs';
import { emptyCourseFormRecord } from 'src/app/shared/state/courses/course.model';
import { Course, MatSelectOption } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
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
  @Select(CourseState.getCourseFormRecord)
  courseFormRecord$: Observable<Course>;
  @Select(GroupState.listGroupOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  @Select(CourseState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number = 4;
  courseFormRecord: Course = emptyCourseFormRecord;
  courseForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.courseForm = this.setupCourseFormGroup();
    this.courseFormRecord$.subscribe((val) => {
      this.courseFormRecord = val;
      this.courseForm = this.setupCourseFormGroup(this.courseFormRecord);
    });

    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
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
      institutions: [
        courseFormRecord.institutions?.map((i) => i.id)
          ? courseFormRecord.institutions?.map((i) => i.id)
          : [],
        Validators.required,
      ],
      description: [courseFormRecord?.description, Validators.required],
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
    console.log('course submit form value => ', form.value);
    this.store.dispatch(
      new CreateUpdateCourseAction({
        form,
        formDirective,
      })
    );
  }
}
