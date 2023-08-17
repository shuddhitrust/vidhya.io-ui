import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable, Subject } from 'rxjs';
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
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-learners-table',
  templateUrl: './learners-table.component.html',
  styleUrls: ['./learners-table.component.scss'],
})
export class LearnersTableComponent implements OnInit, OnDestroy {
  tableTitle: string = ADMIN_SECTION_LABELS.LEARNERS;
  resource: string = resources.LEARNER;
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
    roles: [USER_ROLES_NAMES.LEARNER, USER_ROLES_NAMES.CLASS_ADMIN_LEARNER],
  };
  columns = memberColumns;
  frameworkComponents = {
    memberRenderer: MemberProfileRendererComponent,
  };
  gridOptions: GridOptions;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public dialog: MatDialog, private store: Store) {
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

    dialogRef.afterClosed()   
    .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  
}
