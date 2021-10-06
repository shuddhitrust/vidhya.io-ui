import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';

import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { RoleProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/user-role/components/cell-renderers/role-profile/role-profile-renderer.component';
import { ADMIN_SECTION_LABELS } from 'src/app/shared/common/constants';
import { FetchParams, resources, User } from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import { RoleProfileComponent } from '../../profiles/role-profile/role-profile.component';
import { UserRoleState } from '../../../state/userRole.state';
import {
  FetchUserRolesAction,
  ForceRefetchUserRolesAction,
  ResetUserRoleFormAction,
} from '../../../state/userRole.actions';

@Component({
  selector: 'app-roles-table',
  templateUrl: './roles-table.component.html',
  styleUrls: ['./roles-table.component.scss'],
})
export class RolesTableComponent implements OnInit {
  tableTitle: string = ADMIN_SECTION_LABELS.USER_ROLES;
  resource: string = resources.USER_ROLE;
  roles: object[];
  @Select(UserRoleState.listRoles)
  rows$: Observable<User[]>;
  @Select(UserRoleState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(UserRoleState.errorFetching)
  errorFetching$: Observable<boolean>;
  @Select(UserRoleState.fetchParams)
  fetchParams$: Observable<FetchParams>;

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
      field: 'priority',
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
    this.store.dispatch(new ForceRefetchUserRolesAction());
  }

  createUserRole() {
    this.store.dispatch(new ResetUserRoleFormAction());
    this.router.navigateByUrl(uiroutes.USER_ROLE_FORM_ROUTE.route);
  }

  openRoleProfile(rowData) {
    const dialogRef = this.dialog.open(RoleProfileComponent, {
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {}
}
