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
import {
  defaultResourcePermissions,
  emptyUserRoleFormRecord,
} from 'src/app/shared/state/userRoles/userRole.model';
import {
  CREATE,
  DELETE,
  LIST,
  UPDATE,
  UserRole,
  VIEW,
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
  VIEW = VIEW;
  LIST = LIST;
  CREATE = CREATE;
  UPDATE = UPDATE;
  DELETE = DELETE;
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
  scopes: string[] = ['resource', VIEW, LIST, CREATE, UPDATE, DELETE];
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
        userRoleFormRecord.resourcePermissions
          ? userRoleFormRecord.resourcePermissions
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

  togglePermission(item, action) {
    let newPermissionsObject = Object.assign({}, this.permissionsObject);
    console.log('from togglePermission => ', {
      item,
      action,
      newPermissionsObject,
    });
    const index = this.permissionsObject[item].indexOf(action);
    console.log('index of ', action, ' in ', item, ' => ', index);
    if (index > -1) {
      newPermissionsObject[item].splice(index, 1);
    } else {
      let itemActions = Object.assign([], newPermissionsObject[item]);
      itemActions.push(action);
      console.log('itemActions => ', { itemActions });
      newPermissionsObject[item] = itemActions;
    }
    this.permissionsObject = newPermissionsObject;
    this.permissionsTable = convertPermissionsToTable(this.permissionsObject);
  }

  goBack() {
    this.location.back();
  }

  submitForm(form: FormGroup, formDirective: FormGroupDirective) {
    this.userRoleForm.get('permissions').setValue(this.permissionsObject);
    this.store.dispatch(
      new CreateUpdateUserRoleAction({ form, formDirective })
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
      VIEW: permissionsObject[resource].includes[VIEW] ? true : true,
      LIST: permissionsObject[resource].includes[LIST] ? true : false,
      CREATE: permissionsObject[resource].includes[CREATE] ? true : false,
      UPDATE: permissionsObject[resource].includes[UPDATE] ? true : false,
      DELETE: permissionsObject[resource].includes[DELETE ? true : false],
    };
  }
  return permissionsTableData;
};
