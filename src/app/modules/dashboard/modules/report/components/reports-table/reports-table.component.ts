import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { SearchParams } from 'src/app/shared/modules/master-grid/table.model';
import { Report, FetchParams, resources } from 'src/app/shared/common/models';
import {
  FetchReportsAction,
  ForceRefetchReportsAction,
} from '../../state/report.actions';
import { ReportState } from '../../state/report.state';

@Component({
  selector: 'app-reports-table',
  templateUrl: './reports-table.component.html',
  styleUrls: ['./reports-table.component.scss'],
})
export class ReportsTableComponent implements OnInit {
  tableTitle: string = 'Reports';
  resource: string = resources.REPORT;
  reports: object[];
  @Select(ReportState.listReports)
  rows$: Observable<Report[]>;
  @Select(ReportState.isFetching)
  isFetching$: Observable<boolean>;
  @Select(ReportState.fetchParams)
  fetchParams$: Observable<FetchParams>;

  columns = [
    {
      field: 'name',
      cellRenderer: (params) => {
        return params.data?.participant?.name;
      },
    },
    {
      field: 'institution',
      cellRenderer: (params) => {
        return params.data?.institution?.name;
      },
    },
    {
      field: 'course',
      cellRenderer: (params) => {
        return params.data?.course?.title;
      },
    },
    {
      field: 'completed %',
      cellRenderer: (params) => {
        return params.data.completed;
      },
    },
    {
      field: 'score %',
      cellRenderer: (params) => {
        return params.data.percentage;
      },
    },
  ];
  frameworkComponents = {};
  gridOptions: GridOptions;

  constructor(public dialog: MatDialog, private store: Store) {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this,
      },
    };
  }

  fetchReports(searchParams: SearchParams) {
    this.store.dispatch(new FetchReportsAction({ searchParams }));
  }

  forceRefetchReports(searchParams: SearchParams) {
    this.store.dispatch(new ForceRefetchReportsAction());
  }

  ngOnInit(): void {}
}
