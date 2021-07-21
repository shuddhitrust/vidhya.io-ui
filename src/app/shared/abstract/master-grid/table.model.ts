import { AnyARecord } from 'dns';
import { pageSizeOptions } from './table.config';

export const defaultPageSize = pageSizeOptions[0].value;

export class SearchParams {
  newPageNumber: number = 1;
  newPageSize: number = defaultPageSize;
  sortField: string = null;
  sortOrder: string = null;
  newSearchQuery: string = null;
  newColumnFilters: any = null;
}

export interface ColWidth {
  table: string;
  colId: string;
  width: number;
}

export interface SdkTableColumn {
  field: string;
  headerName: string;
  cellRenderer?: Function | string;
  cellRendererFramework?: Object;
  cellRendererParams?: Object;
  pinned?: string;
  width?: number;
  tooltipValueGetter?: Function;
  sortable?: boolean;
  resizable?: boolean;
  headerCheckboxSelection?: boolean;
  headerCheckboxSelectionFilteredOnly?: boolean;
  checkboxSelection?: boolean;
  filter?: string | boolean;
  unSortIcon?: boolean;
}
