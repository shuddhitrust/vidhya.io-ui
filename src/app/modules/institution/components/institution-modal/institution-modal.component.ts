import { Component, Inject, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import {
  Institution,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { DeleteInstitutionAction } from 'src/app/shared/state/institutions/institution.actions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
@Component({
  selector: 'app-institution-modal',
  templateUrl: './institution-modal.component.html',
  styleUrls: ['./institution-modal.component.scss'],
})
export class InstitutionModalComponent {
  profileData: Institution;
  resource = resources.INSTITUTION;
  resourceActions = RESOURCE_ACTIONS;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<InstitutionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private auth: AuthorizationService
  ) {
    this.profileData = data;
  }

  registrationInviteLink() {
    const parsedUrl = new URL(window.location.href);
    const baseUrl = parsedUrl.origin;

    return `${baseUrl}/register?invitecode=${this.profileData.invitecode}`;
  }
  copyInviteLink() {
    this.store.dispatch(
      new ShowNotificationAction({
        action: 'success',
        message: 'Invitation link copied successfully!',
      })
    );
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
  onClickInstitutionName() {
    this.closeDialog();
    const id = this.profileData.id;
    this.router.navigate([uiroutes.INSTITUTION_PROFILE_ROUTE.route], {
      queryParams: { id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      institutionId: this.profileData?.id,
    });
  }

  editInstitution() {
    this.closeDialog();
    const id = this.profileData.id;
    this.router.navigate([uiroutes.INSTITUTION_FORM_ROUTE.route], {
      relativeTo: this.route,
      queryParams: { id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the user named "${this.profileData.name}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteInstitution();
      }
    });
  }
  deleteInstitution() {
    this.store.dispatch(
      new DeleteInstitutionAction({ id: this.profileData.id })
    );
    this.closeDialog();
  }
}
