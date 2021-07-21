import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { SearchParams } from 'src/app/shared/abstract/master-grid/table.model';
import { MemberProfileRendererComponent } from 'src/app/shared/cell-renderers/member-profile/member-profile-renderer.component';
import { UserModerationRendererComponent } from 'src/app/shared/cell-renderers/user-moderation/user-moderation-renderer.component';
import { getOptionLabel, parseDateTime } from 'src/app/shared/common/functions';
import {
  MembershipStatus,
  FetchParams,
  resources,
  User,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchMembersAction,
  ForceRefetchMembersAction,
} from 'src/app/shared/state/members/member.actions';
import { membershipStatusOptions } from 'src/app/shared/state/members/member.model';
import { MemberState } from 'src/app/shared/state/members/member.state';
import { MemberProfileComponent } from '../../modals/member-profile/member-profile.component';
import { UserModerationProfileComponent } from '../../modals/moderate-user/user-moderation.component';

@Component({
  selector: 'app-awaiting-moderation-table',
  templateUrl: './awaiting-moderation-table.component.html',
  styleUrls: ['./awaiting-moderation-table.component.scss'],
})
export class AwaitingModerationTableComponent implements OnInit {
  tableTitle: string = 'Members Pending Approval';
  resource: string = resources.MODERATION;
  members: object[];
  @Select(MemberState.listMembers)
  rows$: Observable<User[]>;
  @Select(MemberState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(MemberState.errorFetching)
  errorFetching$: Observable<boolean>;
  @Select(MemberState.fetchParams)
  fetchParams$: Observable<FetchParams>;

  defaultColDef = {
    resizable: true,
  };
  columnFilters = {
    membershipStatusNot: MembershipStatus.APPROVED,
  };
  columns = [
    {
      field: 'firstName',
    },
    {
      field: 'lastName',
    },
    { field: 'title' },
    {
      field: 'bio',
    },
    {
      field: 'membershipStatus',
      cellRenderer: (params) => {
        return getOptionLabel(params.value, membershipStatusOptions);
      },
    },
    {
      field: 'lastActive',
      cellRenderer: (params) => {
        return parseDateTime(params.value);
      },
      tooltipField: 'lastActive',
    },
    {
      field: 'moderate',
      cellRenderer: 'moderationRenderer',
    },
  ];
  frameworkComponents = {
    memberRenderer: MemberProfileRendererComponent,
    moderationRenderer: UserModerationRendererComponent,
  };
  gridOptions: GridOptions;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private store: Store
  ) {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this,
      },
    };
  }

  fetchMembers(searchParams: SearchParams) {
    this.store.dispatch(
      new FetchMembersAction({
        searchParams: { ...searchParams, columnFilters: this.columnFilters },
      })
    );
  }

  forceRefetchMembers(searchParams: SearchParams) {
    this.store.dispatch(new ForceRefetchMembersAction({ searchParams }));
  }

  createMember() {
    this.router.navigateByUrl(uiroutes.MEMBER_FORM_ROUTE.route);
  }

  moderateUser(rowData) {
    const dialogRef = this.dialog.open(UserModerationProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  openMemberProfile(rowData) {
    const dialogRef = this.dialog.open(MemberProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {}
}
