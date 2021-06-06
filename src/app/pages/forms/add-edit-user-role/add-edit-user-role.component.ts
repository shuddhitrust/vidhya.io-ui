import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';

import {
  CreateUpdateUserRoleAction,
  GetUserRoleAction,
} from 'src/app/shared/state/userRoles/userRole.actions';
import { UserRoleState } from 'src/app/shared/state/userRoles/userRole.state';
import { Observable } from 'rxjs';
import { emptyUserRoleFormRecord } from 'src/app/shared/state/userRoles/userRole.model';
import { UserRole } from 'src/app/shared/common/models';

@Component({
  selector: 'app-add-edit-user-role',
  templateUrl: './add-edit-user-role.component.html',
  styleUrls: [
    './add-edit-user-role.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditUserRoleComponent implements OnInit {
  formSubmitting: boolean = false;
  params: object = {};
  @Select(UserRoleState.getUserRoleFormRecord)
  userRoleFormRecord$: Observable<UserRole>;
  userRoleFormRecord: UserRole = emptyUserRoleFormRecord;
  @Select(UserRoleState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  userRoleForm: FormGroup;

  constructor(
    private location: Location,
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.userRoleForm = this.setupUserRoleFormGroup();
    this.userRoleFormRecord$.subscribe((val) => {
      console.log('userRole form record was reset', { val });
      this.userRoleFormRecord = val;
      this.userRoleForm = this.setupUserRoleFormGroup(this.userRoleFormRecord);
    });
  }

  setupUserRoleFormGroup = (
    userRoleFormRecord: UserRole = emptyUserRoleFormRecord
  ): FormGroup => {
    console.log('setting up the userRole form ', { userRoleFormRecord });

    const formGroup = this.fb.group({
      id: [userRoleFormRecord.id],
      name: [userRoleFormRecord.name, Validators.required],
      description: [userRoleFormRecord.description, Validators.required],
      permissions: [userRoleFormRecord.permissions, Validators.required],
    });
    return formGroup;
  };
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetUserRoleAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.store.dispatch(
      new CreateUpdateUserRoleAction({ form, formDirective })
    );
  }
}
