import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { convertKeyToLabel } from 'src/app/shared/common/functions';
import {
  defaultResourcePermissions,
  resources,
  RESOURCE_ACTIONS,
  User,
  UserRole,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  DeleteUserRoleAction,
  GetUserRoleAction,
} from 'src/app/shared/state/userRoles/userRole.actions';
import { UserRoleState } from 'src/app/shared/state/userRoles/userRole.state';

@Component({
  selector: 'app-role-profile',
  templateUrl: './role-profile.component.html',
  styleUrls: ['./role-profile.component.scss'],
})
export class RoleProfileComponent {
  profileData: any = {};
  resource = resources.USER_ROLE;
  resourceActions = RESOURCE_ACTIONS;
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
  ];
  @Select(UserRoleState.getUserRoleFormRecord)
  userRoleFormRecord$: Observable<UserRole>;
  @Select(UserRoleState.isFetching)
  isFetching$: Observable<boolean>;
  isFetching = false;
  permissionsObject: object = defaultResourcePermissions;
  permissionsTable: object[] = this.auth.convertPermissionsToTable(
    this.permissionsObject
  );
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RoleProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private auth: AuthorizationService
  ) {
    this.profileData = data;
    this.store.dispatch(
      new GetUserRoleAction({ roleName: this.profileData?.name })
    );
    this.userRoleFormRecord$.subscribe((val) => {
      if (val) {
        this.profileData = val;
        this.permissionsObject = this.profileData.permissions;
        this.permissionsTable = this.auth.convertPermissionsToTable(
          this.permissionsObject
        );
      }
    });
    this.isFetching$.subscribe((val) => {
      this.isFetching = val;
    });
    console.log({
      profileData: this.profileData,
      permissionsObject: this.permissionsObject,
      permissionsTable: this.permissionsTable,
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {});
  }

  keyToLabel(key) {
    return convertKeyToLabel(key);
  }

  editRole() {
    this.closeDialog();
    const id = this.profileData.id;
    this.router.navigate([uiroutes.USER_ROLE_FORM_ROUTE.route], {
      relativeTo: this.route,
      queryParams: { id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  deleteConfirmation() {
    const dialogRef = this.dialog.open(RoleDeleteConfirmationDialog, {
      data: this.profileData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteRole();
      }
    });
  }
  deleteRole() {
    console.log('payload before dispatching Role action => ', {
      id: this.profileData.id,
    });
    this.store.dispatch(new DeleteUserRoleAction({ id: this.profileData.id }));
    this.closeDialog();
  }
}

@Component({
  selector: 'role-delete-confirmation-dialog',
  templateUrl: 'delete-confirmation-dialog.html',
})
export class RoleDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<RoleDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
}
