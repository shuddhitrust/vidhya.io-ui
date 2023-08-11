import { Component, Inject, Input, NgZone, ChangeDetectorRef } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
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
import { DeleteInstitutionAction } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import { Location } from '@angular/common';

@Component({
  selector: 'app-institution-modal',
  templateUrl: './institution-modal.component.html',
  styleUrls: ['./institution-modal.component.scss'],
})
export class InstitutionModalComponent {
  profileData: Institution;
  resource = resources.INSTITUTION;
  resourceActions = RESOURCE_ACTIONS;
  // dialogRef: any;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<InstitutionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private router: Router,
    public location:Location,
    private store: Store,
    private auth: AuthorizationService,
    public ngZone: NgZone,
    private cdRef: ChangeDetectorRef
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
    if (this.dialogRef)
      this.dialogRef.close();
  }
  onClickInstitutionName() {
    this.closeDialog();
    const id = this.profileData.id;
    this.ngZone.run(() =>
      this.router.navigate([uiroutes.INSTITUTION_PROFILE_ROUTE.route], {
        queryParams: { id },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      }));
      // this.cdRef.detectChanges();

  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      institutionId: this.profileData?.id,
    });
  }
  onRouteActivated() {
    // Call OnInit of routed component
    // this.cdRef.detectChanges();
  }

  editInstitution() {    
    const id = this.profileData.id;
    this.dialogRef.close({event:'institution',data:id});

 
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

    this.dialogRef.afterClosed().subscribe((result) => {
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
