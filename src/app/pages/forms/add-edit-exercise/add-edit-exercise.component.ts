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
  CreateUpdateExerciseAction,
  GetExerciseAction,
} from 'src/app/shared/state/exercises/exercise.actions';
import { ExerciseState } from 'src/app/shared/state/exercises/exercise.state';
import { Observable } from 'rxjs';
import { emptyExerciseFormRecord } from 'src/app/shared/state/exercises/exercise.model';
import { Exercise, Course, MatSelectOption } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import { FetchCoursesAction } from 'src/app/shared/state/courses/course.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { CourseState } from 'src/app/shared/state/courses/course.state';
@Component({
  selector: 'app-add-edit-exercise',
  templateUrl: './add-edit-exercise.component.html',
  styleUrls: [
    './add-edit-exercise.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditExerciseComponent implements OnInit {
  formSubmitting: boolean = false;
  currentDate = new Date();
  params: object = {};
  @Select(ExerciseState.getExerciseFormRecord)
  exerciseFormRecord$: Observable<Exercise>;
  @Select(GroupState.listGroupOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  @Select(ExerciseState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number;
  exerciseFormRecord: Exercise = emptyExerciseFormRecord;
  exerciseForm: FormGroup;
  @Select(CourseState.listCourseOptions)
  courseOptions$: Observable<MatSelectOption[]>
  @Select(ExerciseState.listExerciseOptions)
  exerciseOptions$: Observable<MatSelectOption[]>

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.store.dispatch(new FetchCoursesAction({searchParams: defaultSearchParams}));
    this.exerciseForm = this.setupExerciseFormGroup();
    this.courseOptions$.subscribe(val => console.log('ExerciseFormRecord course options = >', val))
    this.exerciseFormRecord$.subscribe((val) => {
      this.exerciseFormRecord = val;
      console.log('ExerciseFormRecord => ', val)
      this.exerciseForm = this.setupExerciseFormGroup(this.exerciseFormRecord);
    });

    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
  }

  setupExerciseFormGroup = (
    exerciseFormRecord: Exercise = emptyExerciseFormRecord
  ): FormGroup => {
    console.log('the current User id ', this.currentUserId);
    return this.fb.group({
      id: [exerciseFormRecord?.id],
      prompt: [exerciseFormRecord?.prompt, Validators.required],
      // instructions: [exerciseFormRecord?.instructions, Validators.required],
      // course: [exerciseFormRecord?.course?.id, Validators.required],
      // prerequisites: [
      //   exerciseFormRecord.prerequisites?.length
      //     ? exerciseFormRecord.prerequisites?.map((i) => i.id)
      //     : [],
      // ],
      // dueDate: [exerciseFormRecord?.dueDate],
      points: [exerciseFormRecord?.points],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetExerciseAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('exercise submit form value => ', form.value);
    this.store.dispatch(
      new CreateUpdateExerciseAction({
        form,
        formDirective,
      })
    );
  }
}
