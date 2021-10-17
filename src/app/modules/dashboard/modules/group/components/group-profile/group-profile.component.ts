import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  CurrentMember,
  Group,
  groupTypeOptions,
  MatSelectOption,
  resources,
  RESOURCE_ACTIONS,
} from 'src/app/shared/common/models';
import { AuthorizationService } from 'src/app/shared/api/authorization/authorization.service';
import { OptionsState } from 'src/app/shared/state/options/options.state';
import { FetchMemberOptionsByInstitution } from 'src/app/shared/state/options/options.actions';
import {
  MasterConfirmationDialog,
  MasterConfirmationDialogObject,
} from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthState } from 'src/app/modules/auth/state/auth.state';
import { GroupState } from '../../state/group.state';
import {
  DeleteGroupAction,
  GetGroupAction,
  ResetGroupFormAction,
} from '../../state/group.actions';
import {
  clipLongText,
  generateGroupSubtitle,
} from 'src/app/shared/common/functions';

@Component({
  selector: 'app-group-profile',
  templateUrl: './group-profile.component.html',
  styleUrls: [
    './group-profile.component.scss',
    './../../../../../../shared/common/shared-styles.css',
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
  @Select(AuthState.getCurrentMember)
  currentMember$: Observable<CurrentMember>;
  currentMember: CurrentMember;
  @Select(OptionsState.listMembersByInstitution)
  memberOptions$: Observable<MatSelectOption[]>;
  memberOptions: MatSelectOption[] = [];
  groupTypeOptions: MatSelectOption[] = groupTypeOptions;
  groupTypeLabel: string = '';
  selectedMemberColumns = [
    { field: 'label', headerName: 'Group Members' },
    { field: 'role', headerName: 'Role' },
  ];
  memberRows: any[] = [];
  constructor(
    public dialog: MatDialog,
    private store: Store,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private auth: AuthorizationService
  ) {
    this.fetchMemberOptions();
    this.memberOptions$.subscribe((val) => {
      this.memberOptions = val;
      this.populateMemberRows();
    });
    this.group$.subscribe((val) => {
      this.group = val;
      this.populateMemberRows();
      this.groupTypeLabel = this.groupTypeOptions.find(
        (option) => option.value == this.group?.groupType
      )?.label;
    });
  }
  renderGroupSubtitle(group: Group) {
    return generateGroupSubtitle(group);
  }

  clip(string) {
    return clipLongText(string, 100);
  }
  fetchMemberOptions() {
    this.currentMember$.subscribe((val) => {
      this.currentMember = val;
    });
    this.store.dispatch(
      new FetchMemberOptionsByInstitution({
        memberInstitutionId: this.currentMember?.institution?.id,
      })
    );
  }
  populateMemberRows() {
    const memberIds = this.group?.members?.map((m) => m.id);
    const adminIds = this.group?.admins?.map((m) => m.id);
    this.memberRows = this.memberOptions.filter((o) => {
      return memberIds?.includes(o.value) || adminIds?.includes(o.value);
    });
    this.memberRows = this.memberRows.map((row) => {
      if (memberIds?.includes(row.value)) {
        row.role = 'Member';
      }
      if (adminIds?.includes(row.value)) {
        row.role = 'Admin';
      }
      return row;
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
    const masterDialogConfirmationObject: MasterConfirmationDialogObject = {
      title: 'Confirm delete?',
      message: `Are you sure you want to delete the group named "${this.group.name}"`,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    };
    const dialogRef = this.dialog.open(MasterConfirmationDialog, {
      data: masterDialogConfirmationObject,
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
