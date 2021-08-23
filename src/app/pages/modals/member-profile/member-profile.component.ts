import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { constructUserFullName } from 'src/app/shared/common/functions';
import {
  resources,
  RESOURCE_ACTIONS,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { DeleteMemberAction } from 'src/app/shared/state/members/member.actions';
import { UserModerationProfileComponent } from '../moderate-user/user-moderation.component';

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
  constructFullName(user) {
    return constructUserFullName(user);
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
    const dialogRef = this.dialog.open(MemberDeleteConfirmationDialog, {
      data: this.profileData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteMember();
      }
    });
  }
  deleteMember() {
    console.log('payload before dispatching Member action => ', {
      id: this.profileData.id,
    });
    this.store.dispatch(new DeleteMemberAction({ id: this.profileData.id }));
    this.closeDialog();
  }
}

@Component({
  selector: 'member-delete-confirmation-dialog',
  templateUrl: 'delete-confirmation-dialog.html',
})
export class MemberDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<MemberDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
}
