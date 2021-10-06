import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';

import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { InstitutionProfileRendererComponent } from 'src/app/modules/dashboard/modules/admin/modules/institution/components/institution-profile-cell-renderer/institution-profile-renderer.component';
import {
  Institution,
  FetchParams,
  resources,
} from 'src/app/shared/common/models';
import { uiroutes } from 'src/app/shared/common/ui-routes';
import {
  ForceRefetchInstitutionsAction,
  FetchInstitutionsAction,
  ResetInstitutionFormAction,
} from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.actions';
import { InstitutionState } from 'src/app/modules/dashboard/modules/admin/modules/institution/state/institutions/institution.state';
import { InstitutionModalComponent } from '../institution-modal/institution-modal.component';
import { ADMIN_SECTION_LABELS } from 'src/app/shared/common/constants';

@Component({
  selector: 'app-institutions-table',
  templateUrl: './institutions-table.component.html',
  styleUrls: ['./institutions-table.component.scss'],
})
export class InstitutionsTableComponent implements OnInit {
  tableTitle: string = ADMIN_SECTION_LABELS.INSTITUTIONS;
  resource: string = resources.INSTITUTION;
  institutions: object[];
  @Select(InstitutionState.listInstitutions)
  rows$: Observable<Institution[]>;
  @Select(InstitutionState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(InstitutionState.fetchParams)
  fetchParams$: Observable<FetchParams>;

  defaultColDef = {
    resizable: true,
    // sortable: true,
    // comparator: () => null,
  };
  columns = [
    {
      field: 'name',
      cellRenderer: 'institutionRenderer',
    },
    { field: 'location' },
    { field: 'city' },
    { field: 'bio' },
  ];
  frameworkComponents = {
    institutionRenderer: InstitutionProfileRendererComponent,
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

  fetchInstitutions(searchParams: SearchParams) {
    this.store.dispatch(new FetchInstitutionsAction({ searchParams }));
  }

  createInstitution() {
    this.store.dispatch(new ResetInstitutionFormAction());
    this.router.navigateByUrl(uiroutes.INSTITUTION_FORM_ROUTE.route);
  }

  forceRefetchInstitutions(searchParams: SearchParams) {
    this.store.dispatch(new ForceRefetchInstitutionsAction());
  }

  openInstitutionProfile(rowData) {
    const dialogRef = this.dialog.open(InstitutionModalComponent, {
      data: rowData,
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  ngOnInit(): void {}
}
