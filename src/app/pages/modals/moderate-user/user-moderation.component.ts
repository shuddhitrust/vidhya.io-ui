import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { constructUserFullName } from 'src/app/shared/common/functions';
import { User } from 'src/app/shared/common/models';

@Component({
  selector: 'app-user-moderation-profile',
  templateUrl: './user-moderation.component.html',
  styleUrls: ['./user-moderation.component.scss'],
})
export class UserModerationProfileComponent {
  profileData: any = {};

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<UserModerationProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store
  ) {
    this.profileData = data;
    console.log('profieData from usermoderationprofile => ', {
      profileData: this.profileData,
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  constructFullName() {
    return constructUserFullName(this.data);
  }

  approvalConfirmation() {
    const dialogRef = this.dialog.open(UserApprovalConfirmationDialog, {
      data: this.profileData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.approveUser();
      }
    });
  }
  approveUser() {
    console.log('payload before dispatching Member action => ', {
      id: this.profileData.id,
    });
    // this.store.dispatch(new ModerateUserAction({ id: this.profileData.id }));
    this.closeDialog();
  }

  denialConfirmation() {
    const dialogRef = this.dialog.open(UserApprovalConfirmationDialog, {
      data: this.profileData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.denyUser();
      }
    });
  }
  denyUser() {
    console.log('payload before dispatching Member action => ', {
      id: this.profileData.id,
    });
    // this.store.dispatch(new ModerateUserAction({ id: this.profileData.id }));
    this.closeDialog();
  }
}

@Component({
  selector: 'user-approval-confirmation-dialog',
  templateUrl: 'approval-confirmation-dialog.html',
})
export class UserApprovalConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<UserApprovalConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
  constructFullName(data) {
    return constructUserFullName(data);
  }
}

@Component({
  selector: 'user-denial-confirmation-dialog',
  templateUrl: 'denial-confirmation-dialog.html',
})
export class UserDenialConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<UserApprovalConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}
  constructFullName(data) {
    return constructUserFullName(data);
  }
}
