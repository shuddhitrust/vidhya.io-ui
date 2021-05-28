import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { User } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { DeleteMemberAction } from 'src/app/shared/state/members/member.actions';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss'],
})
export class MemberProfileComponent {
  profileData: any = {};

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MemberProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.profileData = data;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  editMember() {
    this.closeDialog();
    const id = this.profileData.id;
    this.router.navigate([uiroutes.MEMBER_FORM_ROUTE], {
      relativeTo: this.route,
      queryParams: { id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
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
