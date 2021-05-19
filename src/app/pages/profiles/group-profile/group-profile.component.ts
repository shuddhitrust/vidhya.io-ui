import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteGroup,
  GetGroup,
  ResetGroupForm,
} from 'src/app/shared/state/groups/group.actions';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { Group } from 'src/app/shared/common/models';

@Component({
  selector: 'app-group-profile',
  templateUrl: './group-profile.component.html',
  styleUrls: ['./group-profile.component.scss'],
})
export class GroupProfileComponent implements OnInit, OnDestroy {
  @Select(GroupState.groupFormRecord)
  group$: Observable<Group>;
  group: Group;
  @Select(GroupState.isFetchingFormRecord)
  isFetchingGroup$: Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router
  ) {
    this.group$.subscribe((val) => {
      this.group = val;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const groupId = params['id'];
      this.store.dispatch(new GetGroup({ id: groupId }));
    });
  }

  goBack() {
    this.location.back();
  }

  editGroup() {
    this.router.navigate([uiroutes.GROUP_FORM_ROUTE], {
      queryParams: { id: this.group.id },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
  deleteConfirmation() {
    const dialogRef = this.dialog.open(GroupDeleteConfirmationDialog, {
      data: this.group,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('close dialog result for announcment => ', result);
      if (result == true) {
        this.deleteAnnouncement();
      }
    });
  }
  deleteAnnouncement() {
    console.log('payload before passing to action => ', {
      id: this.group.id,
    });
    this.store.dispatch(new DeleteGroup({ id: this.group.id }));
    this.goBack();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetGroupForm());
  }
}

@Component({
  selector: 'group-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.html',
})
export class GroupDeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<GroupDeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Group
  ) {}
}
