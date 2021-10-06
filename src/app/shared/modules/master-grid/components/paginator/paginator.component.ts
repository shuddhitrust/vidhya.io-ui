import {
  Component,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { defaultPageSize } from '../../table.model';
import { pageSizeOptions } from '../../table.config';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnChanges {
  @Input() totalRecords = defaultPageSize;
  @Input() currentPage = 1;
  @Input() pageSize = defaultPageSize;
  @Input() rowsShowing = defaultPageSize;
  @Input() searchQuery: string;
  @Input() staticTable = false;
  @Output() onPageChange: EventEmitter<any> = new EventEmitter();
  @Output() onPageSizeChange: EventEmitter<any> = new EventEmitter();
  searchInfoText = '';
  hidePageSizeOptions = false; // If the number of records is fewer than the lowest pageSize, then don't show it.
  currentlyShowing: number; // Number of currently visible records on screen (including ones visible on scroll)
  pageSizeOptions: Array<any> = pageSizeOptions.map((p) => p.value); // Options visible in the page size options
  lastPage: number; // The number of pages. This is a calculated number based on the total number of records and pageSize
  showSearchTextInfo = () => {
    return typeof this.totalRecords === 'number' && this.currentlyShowing !== 0;
  };
  runOnPageChange(newPage: number): void {
    if (this.onPageChange) {
      this.onPageChange.emit(newPage);
    }
  }
  runOnPageSizeChange(newPageSize: number): void {
    this.onPageSizeChange.emit(newPageSize);
  }
  SetPaginationMeta = () => {
    // Calculating the last page from total records...
    this.lastPage = lastPageCalculator(this.totalRecords, this.pageSize);
    // Calculating the no. of records being shown on current page...
    if (this.staticTable) {
      // If this table has no server side functions enabled...
      this.currentlyShowing = this.totalRecords;
    }
    // Calculate how many records are showing in the table right now
    // if (this.totalRecords > this.pageSize) {
    //   this.currentlyShowing = this.rowsShowing;
    // } else {
    //   this.currentlyShowing = this.totalRecords;
    // }
    this.currentlyShowing = this.rowsShowing;

    this.calculatePageSizeOptionsVisibility();
    this.calculateSearchText();
  };

  /**
   * Methodd to calculate whether to show or hide the pageSizeOptions
   */
  calculatePageSizeOptionsVisibility = () => {
    if (
      (this.currentlyShowing < defaultPageSize &&
        this.lastPage != this.currentPage) ||
      this.totalRecords < defaultPageSize
    ) {
      // If the total number of records is less than the lowest page size,
      // or if in the case of the number of records for search results is
      // lower than the lowest page size, hide the page size options dropdown
      this.hidePageSizeOptions = true;
    } else {
      this.hidePageSizeOptions = false;
    }
  };
  /**
   * This is the methodd to calculate the text that shows on the left side bottom under the table
   */
  calculateSearchText = () => {
    const record = this.currentlyShowing > 1 ? 'records' : 'record';
    // Check whether to show total reqcords
    const showTotalRecords = !this.searchQuery && !this.hidePageSizeOptions;
    this.searchInfoText = `Showing ${this.currentlyShowing} ${
      this.searchQuery
        ? `${record} for "${this.searchQuery}"`
        : `${showTotalRecords ? `of ${this.totalRecords}` : ''} ${record}`
    }`;
  };
  constructor() {}

  ngOnInit() {
    this.SetPaginationMeta();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Recalculating the pagination related info. on every change...
    this.SetPaginationMeta();
  }
}

/*
 * Function to calculate the last page...
 */
const lastPageCalculator = (totalRecords, pageSize) => {
  const lastPage = totalRecords / pageSize;
  if (totalRecords === 1) {
    return 1;
  } else {
    return Math.ceil(lastPage);
  }
};
