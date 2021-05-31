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
  CreateUpdateAssignmentAction,
  GetAssignmentAction,
} from 'src/app/shared/state/assignments/assignment.actions';
import { AssignmentState } from 'src/app/shared/state/assignments/assignment.state';
import { Observable } from 'rxjs';
import { emptyAssignmentFormRecord } from 'src/app/shared/state/assignments/assignment.model';
import { Assignment, MatSelectOption } from 'src/app/shared/common/models';
import { AuthState } from 'src/app/shared/state/auth/auth.state';
import { GroupState } from 'src/app/shared/state/groups/group.state';
@Component({
  selector: 'app-add-edit-assignment',
  templateUrl: './add-edit-assignment.component.html',
  styleUrls: [
    './add-edit-assignment.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditAssignmentComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(AssignmentState.getAssignmentFormRecord)
  assignmentFormRecord$: Observable<Assignment>;
  @Select(GroupState.listGroupOptions)
  groupOptions$: Observable<MatSelectOption[]>;
  @Select(AssignmentState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  @Select(AuthState.getCurrentMemberInstitutionId)
  currentMemberInstitutionId$: Observable<number>;
  currentMemberInstitutionId: number = 1;
  @Select(AuthState.getCurrentUserId)
  currentUserId$: Observable<number>;
  currentUserId: number = 4;
  assignmentFormRecord: Assignment = emptyAssignmentFormRecord;
  assignmentForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.assignmentForm = this.setupAssignmentFormGroup();
    this.assignmentFormRecord$.subscribe((val) => {
      this.assignmentFormRecord = val;
      this.assignmentForm = this.setupAssignmentFormGroup(
        this.assignmentFormRecord
      );
    });

    this.currentUserId$.subscribe((val) => {
      this.currentUserId = val;
    });
  }

  setupAssignmentFormGroup = (
    assignmentFormRecord: Assignment = emptyAssignmentFormRecord
  ): FormGroup => {
    console.log('the current User id ', this.currentUserId);
    return this.fb.group({
      id: [assignmentFormRecord?.id],
      title: [assignmentFormRecord?.title, Validators.required],
      instructions: [assignmentFormRecord?.instructions, Validators.required],
      course: [assignmentFormRecord?.course?.id, Validators.required],
    });
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetAssignmentAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    console.log('assignment submit form value => ', form.value);
    this.store.dispatch(
      new CreateUpdateAssignmentAction({
        form,
        formDirective,
      })
    );
  }
}
