import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { generateMemberSubtitle } from 'src/app/shared/common/functions';
import {
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { DeleteMemberAction } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.actions';
import { UserModerationProfileComponent } from '../modals/moderate-user/user-moderation.component';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss'],
})
export class MemberProfileComponent {
  profileData: any = {};
  resource = resources.MEMBER;
  resourceActions = RESOURCE_ACTIONS;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MemberProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store,
    private auth: AuthorizationService
  ) {
    this.profileData = data;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  generateSubtitle(user = this.profileData) {
    return generateMemberSubtitle(user);
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      institutionId: this.profileData?.instituion?.id,
    });
  }

  // editMember() {
  //   this.closeDialog();
  //   const id = this.profileData.id;
  //   this.router.navigate([uiroutes.MEMBER_FORM_ROUTE.route], {
  //     relativeTo: this.route,
  //     queryParams: { id },
  //     queryParamsHandling: 'merge',
  //     skipLocationChange: false,
  //   });
  // }

  editMember() {
    const dialogRef = this.dialog.open(UserModerationProfileComponent, {
      data: this.profileData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  deleteConfirmation() {
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the institution named "${this.profileData.name}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteMember();
      }
    });
  }
  deleteMember() {
    this.store.dispatch(new DeleteMemberAction({ id: this.profileData.id }));
    this.closeDialog();
  }
}
