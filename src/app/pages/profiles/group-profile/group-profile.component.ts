import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DeleteGroupAction,
  GetGroupAction,
  ResetGroupFormAction,
} from 'src/app/shared/state/groups/group.actions';
import { GroupState } from 'src/app/shared/state/groups/group.state';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  Group,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';

@Component({
  selector: 'app-group-profile',
  templateUrl: './group-profile.component.html',
  styleUrls: [
    './group-profile.component.scss',
    './../../../shared/common/shared-styles.css',
  ],
})
export class GroupProfileComponent implements OnInit, OnDestroy {
  resource = resources.GROUP;
  resourceActions = RESOURCE_ACTIONS;
  @Select(GroupState.getGroupFormRecord)
  group$: Observable<Group>;
  group: Group;
  @Select(GroupState.isFetching)
  isFetchingGroup$: Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.group$.subscribe((val) => {
      this.group = val;
    });
  }

  authorizeResourceMethod(action) {
    return this.auth.authorizeResource(this.resource, action, {
      adminIds: this.group?.admins?.map((admin) => admin.id),
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const groupId = params['id'];
      
      this.store.dispatch(new GetGroupAction({ id: groupId }));
    });
  }

  goBack() {
    this.location.back();
  }

  editGroup() {
    this.router.navigate([uiroutes.GROUP_FORM_ROUTE.route], {
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
      
      if (result == true) {
        this.deleteGroup();
      }
    });
  }
  deleteGroup() {
    this.store.dispatch(new DeleteGroupAction({ id: this.group.id }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetGroupFormAction());
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
