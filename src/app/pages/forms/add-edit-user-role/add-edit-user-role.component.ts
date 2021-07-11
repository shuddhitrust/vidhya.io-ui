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
import {
  RESOURCE_ACTIONS,
  defaultResourcePermissions,
  UserRole,
} from 'src/app/shared/common/models';
import { convertKeyToLabel } from 'src/app/shared/common/functions';

@Component({
  selector: 'app-add-edit-user-role',
  templateUrl: './add-edit-user-role.component.html',
  styleUrls: [
    './add-edit-user-role.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class AddEditUserRoleComponent implements OnInit {
  LIST = RESOURCE_ACTIONS.LIST;
  GET = RESOURCE_ACTIONS.GET;
  CREATE = RESOURCE_ACTIONS.CREATE;
  UPDATE = RESOURCE_ACTIONS.UPDATE;
  DELETE = RESOURCE_ACTIONS.DELETE;
  scopes = [
    'resource',
    this.LIST,
    this.GET,
    this.CREATE,
    this.UPDATE,
    this.DELETE,
    'all',
  ];
  formSubmitting: boolean = false;
  params: object = {};
  @Select(UserRoleState.getUserRoleFormRecord)
  userRoleFormRecord$: Observable<UserRole>;
  userRoleFormRecord: UserRole = emptyUserRoleFormRecord;
  @Select(UserRoleState.formSubmitting)
  formSubmitting$: Observable<boolean>;
  userRoleForm: FormGroup;
  permissionsObject: object = defaultResourcePermissions;
  permissionsTable: object[] = convertPermissionsToTable(
    this.permissionsObject
  );
  permissionItems: string[] = Object.keys(defaultResourcePermissions);
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
    console.log('Permissions Table => ', this.permissionsTable);
  }

  setupUserRoleFormGroup = (
    userRoleFormRecord: UserRole = emptyUserRoleFormRecord
  ): FormGroup => {
    console.log('setting up the userRole form ', { userRoleFormRecord });

    const formGroup = this.fb.group({
      id: [userRoleFormRecord.id],
      name: [userRoleFormRecord.name, Validators.required],
      description: [userRoleFormRecord.description, Validators.required],
      permissions: [
        userRoleFormRecord.permissions
          ? userRoleFormRecord.permissions
          : defaultResourcePermissions,
        Validators.required,
      ],
    });
    this.permissionsObject = formGroup.get('permissions').value;
    this.permissionItems = Object.keys(this.permissionsObject);
    this.permissionsTable = convertPermissionsToTable(this.permissionsObject);
    console.log('before setting the table => ', {
      permissionsObject: this.permissionsObject,
      permissionsTable: this.permissionsTable,
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

  keyToLabel(key) {
    return convertKeyToLabel(key);
  }

  toggleAll() {
    let newPermissionsObject = Object.assign({}, this.permissionsObject);
    const items = Object.keys(newPermissionsObject);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let resource = Object.assign({}, newPermissionsObject[item]);
      const actions = Object.keys(RESOURCE_ACTIONS);
      for (let j = 0; j < actions.length; j++) {
        const action = actions[j];
        resource[action] = !resource[action];
      }
      newPermissionsObject[item] = resource;
      this.permissionsObject = newPermissionsObject;
      this.permissionsTable = convertPermissionsToTable(this.permissionsObject);
    }
  }

  toggleRow(item) {
    let newPermissionsObject = Object.assign({}, this.permissionsObject);
    let resource = Object.assign({}, newPermissionsObject[item]);
    const actions = Object.keys(RESOURCE_ACTIONS);
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      resource[action] = !resource[action];
    }
    newPermissionsObject[item] = resource;
    this.permissionsObject = newPermissionsObject;
    this.permissionsTable = convertPermissionsToTable(this.permissionsObject);
  }

  togglePermission(item, action) {
    let newPermissionsObject = Object.assign({}, this.permissionsObject);
    let resource = Object.assign({}, newPermissionsObject[item]);
    resource[action] = !resource[action];
    newPermissionsObject[item] = resource;
    this.permissionsObject = newPermissionsObject;
    this.permissionsTable = convertPermissionsToTable(this.permissionsObject);
  }

  goBack() {
    this.location.back();
  }

  submitForm(formDirective: FormGroupDirective) {
    this.userRoleForm.get('permissions').setValue(this.permissionsObject);
    console.log('form => ', {
      form: this.userRoleForm.value,
      permissionObject: this.permissionsObject,
      example: this.permissionsObject['MODERATION']['LIST'],
    });
    this.store.dispatch(
      new CreateUpdateUserRoleAction({ form: this.userRoleForm, formDirective })
    );
  }
}

const convertPermissionsToTable = (permissionsObject: object): object[] => {
  let permissionsTableData = [];
  const permissionItems = Object.keys(permissionsObject);
  for (let i = 0; i < permissionItems.length; i++) {
    const resource = permissionItems[i];
    permissionsTableData[i] = {
      resource,
    };
    const resourceActions = Object.keys(RESOURCE_ACTIONS);
    for (let j = 0; j < resourceActions.length; j++) {
      const resourceAction = resourceActions[j];
      permissionsTableData[i] = {
        ...permissionsTableData[i],
        [resourceAction]:
          typeof permissionsObject[resource][resourceAction] == 'boolean'
            ? permissionsObject[resource][resourceAction]
            : false,
      };
    }
  }
  console.log('after constructing the table => ', { permissionsTableData });
  return permissionsTableData;
};
