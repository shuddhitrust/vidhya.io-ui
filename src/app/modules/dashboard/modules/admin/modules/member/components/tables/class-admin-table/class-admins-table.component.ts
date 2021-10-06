import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { MemberProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/member/components/cell-renderers/member-profile/member-profile-renderer.component';
import {
  ADMIN_SECTION_LABELS,
  USER_ROLES_NAMES,
} from 'src/app/shared/common/constants';
import { FetchParams, resources, User } from 'src/app/shared/common/models';
import {
  FetchMembersAction,
  ForceRefetchMembersAction,
} from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.actions';
import { memberColumns } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
import { MemberProfileComponent } from '../../member-profile/member-profile.component';

@Component({
  selector: 'app-class-admins-table',
  templateUrl: './class-admins-table.component.html',
  styleUrls: ['./class-admins-table.component.scss'],
})
export class ClassAdminsTableComponent implements OnInit {
  tableTitle: string = ADMIN_SECTION_LABELS.CLASS_ADMINS;
  resource: string = resources.CLASS_ADMIN;
  members: object[];
  @Select(MemberState.listMembers)
  rows$: Observable<User[]>;
  @Select(MemberState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(MemberState.errorFetching)
  errorFetching$: Observable<boolean>;
  @Select(MemberState.fetchParams)
  fetchParams$: Observable<FetchParams>;
  columnFilters = {
    roles: [USER_ROLES_NAMES.CLASS_ADMIN, USER_ROLES_NAMES.CLASS_ADMIN_LEARNER],
  };
  defaultColDef = {
    resizable: true,
  };
  columns = memberColumns;
  frameworkComponents = {
    memberRenderer: MemberProfileRendererComponent,
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
    this.store.dispatch(new ForceRefetchMembersAction());
  }

  openMemberProfile(rowData) {
    const dialogRef = this.dialog.open(MemberProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {}
}
