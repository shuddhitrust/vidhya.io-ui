import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { DeleteUserRoleAction } from 'src/app/shared/state/userRoles/userRole.actions';

@Component({
  selector: 'app-role-profile',
  templateUrl: './role-profile.component.html',
  styleUrls: ['./role-profile.component.scss'],
})
export class RoleProfileComponent {
  profileData: any = {};
  resource = resources.USER_ROLES;
  resourceActions = RESOURCE_ACTIONS;
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
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {});
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
