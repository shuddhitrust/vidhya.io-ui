import { Component, Inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  Institution,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { InstitutionState } from 'src/app/shared/state/institutions/institution.state';
import {
  DeleteInstitutionAction,
  GetInstitutionAction,
} from 'src/app/shared/state/institutions/institution.actions';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { ShowNotificationAction } from 'src/app/shared/state/notifications/notification.actions';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-institution-profile',
  templateUrl: './institution-profile.component.html',
  styleUrls: [
    './institution-profile.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class InstitutionProfileComponent implements OnInit {
  resource = resources.INSTITUTION;
  resourceActions = RESOURCE_ACTIONS;
  params: object = {};
  @Select(InstitutionState.getInstitutionFormRecord)
  institutionFormRecord$: Observable<Institution>;
  institution: Institution;

  constructor(
    public dialog: MatDialog,
    // public dialogRef: MatDialogRef<InstitutionProfileComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private location: Location,
    private router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private auth: AuthorizationService
  ) {
    this.institutionFormRecord$.subscribe((val) => {
      this.institution = val;
    });
  }

  registrationInviteLink() {
    const parsedUrl = new URL(window.location.href);
    const baseUrl = parsedUrl.origin;

    return `${baseUrl}/register?invitecode=${this.institution.invitecode}`;
  }
  copyInviteLink() {
    this.store.dispatch(
      new ShowNotificationAction({
        action: 'success',
        message: 'Invitation link copied successfully!',
      })
    );
  }
  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      institutionId: this.institution.id,
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params;
      const id = params['id'];
      if (id) {
        this.store.dispatch(new GetInstitutionAction({ id }));
      }
    });
  }

  goBack() {
    this.location.back();
  }

  // closeDialog(): void {
  //   this.dialogRef.close();
  // }

  editInstitution() {
    this.router.navigate([uiroutes.INSTITUTION_FORM_ROUTE.route], {
      queryParams: { id: this.institution.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the institution named "${this.institution.name}"`,
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
      new DeleteInstitutionAction({ id: this.institution.id })
    );
    // this.closeDialog();
  }
}
