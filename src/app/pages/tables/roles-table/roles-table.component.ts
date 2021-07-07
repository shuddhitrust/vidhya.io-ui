import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { SearchParams } from 'src/app/shared/abstract/master-grid/table.model';
import { RoleProfileRendererComponent } from 'src/app/shared/cell-renderers/role-profile/role-profile-renderer.component';
import { PaginationObject, User } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  FetchUserRolesAction,
  ForceRefetchUserRolesAction,
  ResetUserRoleFormAction,
} from 'src/app/shared/state/userRoles/userRole.actions';
import { UserRoleState } from 'src/app/shared/state/userRoles/userRole.state';
import { RoleProfileComponent } from '../../modals/role-profile/role-profile.component';
import { USER_ROLES_LABEL } from '../../static/dashboard/tabs/admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-roles-table',
  templateUrl: './roles-table.component.html',
  styleUrls: ['./roles-table.component.scss'],
})
export class RolesTableComponent implements OnInit {
  tableTitle: string = USER_ROLES_LABEL;
  roles: object[];
  @Select(UserRoleState.listRoles)
  rows$: Observable<User[]>;
  @Select(UserRoleState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(UserRoleState.errorFetching)
  errorFetching$: Observable<boolean>;
  @Select(UserRoleState.paginationObject)
  paginationObject$: Observable<PaginationObject>;

  defaultColDef = {
    resizable: true,
  };
  columnFilters = {
    // roleshipStatus: { eq: RoleshipStatus.PENDING_APPROVAL },
  };
  columns = [
    {
      field: 'name',
      cellRenderer: 'userRoleRenderer',
    },
    {
      field: 'description',
    },
  ];
  frameworkComponents = {
    userRoleRenderer: RoleProfileRendererComponent,
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

  fetchUserRoles(searchParams: SearchParams) {
    this.store.dispatch(new FetchUserRolesAction({ searchParams }));
  }

  forceRefetchUserRoles(searchParams: SearchParams) {
    this.store.dispatch(new ForceRefetchUserRolesAction({ searchParams }));
  }

  createUserRole() {
    this.store.dispatch(new ResetUserRoleFormAction());
    this.router.navigateByUrl(uiroutes.USER_ROLE_FORM_ROUTE);
  }

  openRoleProfile(rowData) {
    const dialogRef = this.dialog.open(RoleProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {}
}
