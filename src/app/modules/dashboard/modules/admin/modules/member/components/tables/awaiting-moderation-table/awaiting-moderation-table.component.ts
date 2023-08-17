import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable, Subject } from 'rxjs';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { MemberProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/member/components/cell-renderers/member-profile/member-profile-renderer.component';
import { autoGenOptions, getOptionLabel } from 'src/app/shared/common/functions';
import {
  MembershipStatusOptions,
  ModerationMembershipStatusOptions,
  FetchParams,
  resources,
  User,
  MatSelectOption
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchMembersAction,
  ForceRefetchMembersAction,
} from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.actions';
import { membershipStatusOptions } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.model';
import { MemberState } from 'src/app/modules/dashboard/modules/admin/modules/member/state/member.state';
import { MemberProfileComponent } from '../../member-profile/member-profile.component';
import { UserModerationProfileComponent } from '../../modals/moderate-user/user-moderation.component';
import { UserModerationRendererComponent } from '../../cell-renderers/user-moderation/user-moderation-renderer.component';
import moment from 'moment';
import { FetchAssignmentsAction } from 'src/app/modules/dashboard/modules/assignment/state/assignment.actions';
import { defaultSearchParams } from 'src/app/shared/common/constants';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-awaiting-moderation-table',
  templateUrl: './awaiting-moderation-table.component.html',
  styleUrls: ['./awaiting-moderation-table.component.scss'],
})
export class AwaitingModerationTableComponent implements OnInit,OnDestroy {
  submissionStatusFilter: string = 'PE';
  params: object = {};
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
  groupByFilter: string = resources.MODERATION;
  columnFilters:any = {
    groupBy: this.groupByFilter,
    membershipStatusIs: this.submissionStatusFilter
  };
  columns = [
    {
      field: 'username',
    },
    {
      field: 'name',
    },
    {
      field: 'email',
    },
    {
      field: 'institution',
      cellRenderer: (params) => {
        return params?.data?.institution?.name;
      },
    },
    {
      field:'designation'
    },
    {      
      field: 'dateJoined',
      headerName:'Registration Date',
      cellRenderer:(params)=>{
        return moment(params.value).format('DD-MM-YYYY HH:mm:ss');
      }
    },
    { field: 'title' },
    {
      field: 'membershipStatus',
      cellRenderer: (params) => {
        return getOptionLabel(params.value, membershipStatusOptions);
      },
    },
    // {
    //   field: 'lastActive',
    //   cellRenderer: (params) => {
    //     return parseDateTime(params.value);
    //   },
    //   tooltipField: 'lastActive',
    // },
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
  MembershipStatusTypes = MembershipStatusOptions;
  moderationMembershipStatusOptions: MatSelectOption[] = autoGenOptions({
    ...ModerationMembershipStatusOptions,
  });
  routerParams: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private store: Store,
    private route: ActivatedRoute
  ) {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this,
      },
    };
  }

  fetchMembers(searchParams: SearchParams=null) {
    if(!searchParams){
      searchParams = defaultSearchParams
    }
    this.updateMemberFilter();
    this.store.dispatch(
      new FetchMembersAction({
        searchParams: { ...searchParams, columnFilters: this.columnFilters },
      })
    );
  }

  forceRefetchMembers(searchParams: SearchParams) {
    this.store.dispatch(new ForceRefetchMembersAction());
  }

  createMember() {
    this.router.navigateByUrl(uiroutes.MEMBER_FORM_ROUTE.route);
  }

  moderateUser(rowData) {
    const dialogRef = this.dialog.open(UserModerationProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  openMemberProfile(rowData) {
    const dialogRef = this.dialog.open(MemberProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed()   .pipe(takeUntil(this.destroy$)).subscribe((result) => {});
  }

  updateMemberFilter() {
    const membershipStatusIs = this.submissionStatusFilter;
    this.columnFilters = {
      membershipStatusIs,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { membershipStatusIs},
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  ngOnInit(): void {
    this.routerParams = this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      console.log('params',params);
      this.params = params;
      const statusOptions = Object.values(ModerationMembershipStatusOptions);
      const status = params['membershipStatusIs'];
      this.submissionStatusFilter = statusOptions.includes(status)
        ? status
        : 'PE';
      if (this.submissionStatusFilter) {
        this.fetchMembers();
      }
    });

  }

  ngOnDestroy(){
    // debugger
    this.destroy$.next(true);
    this.destroy$.complete();

    // if(this.routerParams){
    //   this.routerParams.unsubscribe();
    // }
  }
}
